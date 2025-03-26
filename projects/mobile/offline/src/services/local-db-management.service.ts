import { Injectable } from '@angular/core';

import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

import {
    DataType,
    DEFAULT_FORMATS,
    executePromiseChain,
    extractType,
    isAndroid,
    isIos,
    noop,
    toPromise,
    transformFileURI
} from '@wm/core';
import { DeviceFileService, DeviceService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';
import { formatDate } from '@wm/variables';

import { LocalKeyValueService } from './local-key-value.service';
import { LocalDBStore } from '../models/local-db-store';
import { escapeName } from '../utils/utils';
import { ColumnInfo, DBInfo, EntityInfo, NamedQueryInfo, PullType } from '../models/config';
import {
    chain,
    find,
    forEach,
    isEmpty,
    isUndefined,
    map,
    now,
    parseInt,
    replace,
    toUpper,
    toString,
    values,
    isArray, assignIn
} from "lodash-es";
import * as momentLib  from 'moment';
const moment = momentLib.default || window['moment'];
declare const cordova;
declare const Zeep;

const  NEXT_ID_COUNT = 'localDBStore.nextIdCount';
const META_LOCATION = 'www/metadata/app';
const OFFLINE_WAVEMAKER_DATABASE_SCHEMA = {
    name: 'wavemaker',
    version: 1,
    isInternal: true,
    tables: [
        {
            name: 'key_value',
            entityName: 'key-value',
            columns: [{
                fieldName: 'id',
                name: 'id',
                generatorType : 'databaseIdentity',
                sqlType : 'number',
                primaryKey: true
            }, {
                fieldName: 'key',
                name: 'key'
            }, {
                name: 'value',
                fieldName: 'value'
            }]
        },
        {
            name: 'offlineChangeLog',
            entityName: 'offlineChangeLog',
            columns: [{
                fieldName: 'id',
                name: 'id',
                generatorType: 'databaseIdentity',
                sqlType: 'number',
                primaryKey: true
            }, {
                name: 'service',
                fieldName: 'service'
            }, {
                name: 'operation',
                fieldName: 'operation'
            }, {
                name: 'params',
                fieldName: 'params'
            }, {
                name: 'timestamp',
                fieldName: 'timestamp'
            }, {
                name: 'hasError',
                fieldName: 'hasError'
            }, {
                name: 'errorMessage',
                fieldName: 'errorMessage'
            }]
        }
    ]
};

export interface CallBack {
    onDbCreate?: (info: any) => any;
    postImport?: (importFolderPath: string, metaInfo: any) => any;
    preExport?: (folderToExportFullPath: string, metaInfo: any) => any;
}

@Injectable({providedIn: 'root'})
export class LocalDBManagementService {
    static readonly SERVICE_NAME = 'LocalDBManagementService';
    private callbacks: CallBack[] = [];
    private dbInstallDirectory: string;
    private dbInstallDirectoryName: string;
    private dbInstallParentDirectory: string;
    private databases: Map<string, DBInfo>;
    private _logSql = false;
    public nextId = 100000000000;
    private readonly systemProperties = {
        'USER_ID' : {
            'name' : 'USER_ID',
            'value' : () => this.securityService.getLoggedInUser().then( userInfo => userInfo.userId)
        },
        'USER_NAME' : {
            'name' : 'USER_NAME',
            'value' : () => this.securityService.getLoggedInUser().then( userInfo => userInfo.userName)
        },
        'DATE_TIME' : {
            'name' : 'DATE_TIME',
            'value' : () => moment().format('YYYY-MM-DDThh:mm:ss')
        },
        'DATE' : {
            'name' : 'CURRENT_DATE',
            'value' : () => moment().format('YYYY-MM-DD')
        },
        'TIME' : {
            'name' : 'TIME',
            'value' : () => moment().format('hh:mm:ss')
        }
    };

    constructor(
        private appVersion: AppVersion,
        private deviceService: DeviceService,
        private deviceFileService: DeviceFileService,
        private file: File,
        private localKeyValueService: LocalKeyValueService,
        private securityService: SecurityService,
        private sqlite: SQLite
    ) {}

    /**
     * Closes all databases.
     *
     * @returns {object} a promise.
     */
    public close(): Promise<any> {
        return new Promise((resolve, reject) => {
            // Before closing databases, give some time for the pending transactions (if any).
            setTimeout(() => {
                // @ts-ignore
                const closePromises = map(values(this.databases), db => db.sqliteObject.close());
                Promise.all(closePromises).then(resolve, reject);
            }, 1000);
        });
    }

    public nextIdCount() {
        this.nextId = this.nextId + 1;
        this.localKeyValueService.put(NEXT_ID_COUNT, this.nextId);
        return this.nextId;
    }

    /**
     * Executes a named query.
     *
     * @param {string} dbName name of database on which the named query has to be run
     * @param {string} queryName name of the query to execute
     * @param {object} params parameters required for query.
     * @returns {object} a promise.
     */
    public executeNamedQuery(dbName: string, queryName: string, params: any) {
        let queryData, paramPromises;
        if (!this.databases[dbName] || !this.databases[dbName].queries[queryName]) {
            return Promise.reject(`Query by name ' ${queryName} ' Not Found`);
        }
        queryData = this.databases[dbName].queries[queryName];
        paramPromises = chain(queryData.params)
            .filter(p => p.variableType !== 'PROMPT')
            .forEach(p => {
                const paramValue = this.systemProperties[p.variableType].value(p.name, params);
                return toPromise(paramValue).then(v => params[p.name] = v);
            }).value();
        return Promise.all(paramPromises).then(() => {
            params = map(queryData.params, p => {
                // Sqlite will accept DateTime value as below format.
                if (typeof params[p.name] !== 'string'
                    && (p.type === DataType.DATETIME || p.type === DataType.LOCALDATETIME)) {
                    return formatDate(params[p.name], p.type);
                }
                // sqlite accepts the bool val as 1,0 hence convert the boolean value to number
                if (p.type === DataType.BOOLEAN) {
                    return this.convertBoolToInt(params[p.name]);
                }
                return params[p.name];
            });
            return this.executeSQLQuery(dbName, queryData.query, params)
                .then(result => {
                    let firstRow,
                        needTransform;
                    if (!isEmpty(result.rows)) {
                        firstRow = result.rows[0];
                        needTransform = find(queryData.response.properties, p => !firstRow.hasOwnProperty(p.fieldName));
                        if (!isUndefined(needTransform)) {
                            result.rows = map(result.rows, row => {
                                const transformedRow = {},
                                    rowWithUpperKeys = {};
                                // This is to make search for data as case-insensitive
                                forEach(row, (v, k) => rowWithUpperKeys[k.toUpperCase()] = v);
                                forEach(queryData.response.properties, p => {
                                    // format the value depending on the typeRef specified in properties.
                                    const propType = extractType(p.fieldType.typeRef);
                                    const formatValue = DEFAULT_FORMATS[toUpper(propType)];
                                    const fieldVal = row[p.name];
                                    if (fieldVal && typeof fieldVal !== 'string'
                                        && (propType === DataType.DATETIME || propType === DataType.LOCALDATETIME || propType === DataType.DATE)) {
                                        if (moment(fieldVal).isValid()) {
                                            row[p.name] = formatDate(fieldVal, propType);
                                        } else if (moment(fieldVal, 'HH:mm').isValid()) {
                                            // if the value is in HH:mm:ss format, it returns a wrong date. So append the date to the given value to get date
                                            row[p.name] = moment().format('YYYY-MM-DD') + 'T' + fieldVal;
                                        }
                                    }
                                    if (propType === DataType.BOOLEAN) {
                                        row[p.name] = this.convertIntToBool(fieldVal);
                                    }
                                    rowWithUpperKeys[p.nameInUpperCase] = row[p.name];
                                    transformedRow[p.name] = row[p.name];
                                    transformedRow[p.fieldName] = row[p.fieldName] || rowWithUpperKeys[p.nameInUpperCase];
                                });
                                return transformedRow;
                            });
                        }
                    }
                    return result;
                });
        });
    }

    /**
     * This function will export the databases in a zip format.
     *
     * @returns {object} a promise that is resolved when zip is created.
     */
    public exportDB(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const folderToExport = 'offline_temp_' + now(),
                folderToExportFullPath = cordova.file.cacheDirectory + folderToExport + '/',
                zipFileName = '_offline_data.zip',
                metaInfo = {
                    app: null,
                    OS: '',
                    createdOn: 0
                };
            let zipDirectory;
            if (isIos()) {
                // In IOS, save zip to documents directory so that user can export the file from IOS devices using iTUNES.
                zipDirectory = cordova.file.documentsDirectory;
            } else {
                // In Android, save zip to download directory.
                zipDirectory = cordova.file.externalRootDirectory + 'Download/';
            }
            // Create a temporary folder to copy all the content to export
            this.file.createDir(cordova.file.cacheDirectory, folderToExport, false)
                .then(() => {
                    // Copy databases to temporary folder for export
                    return this.file.copyDir(this.dbInstallParentDirectory, this.dbInstallDirectoryName, folderToExportFullPath, 'databases')
                        .then(() => {
                            // Prepare meta info to identify the zip and other info
                            return this.getAppInfo();
                        }).then(appInfo => {
                            metaInfo.app = (appInfo as any);
                            if (isIos()) {
                                metaInfo.OS = 'IOS';
                            } else if (isAndroid()) {
                                metaInfo.OS = 'ANDROID';
                            }
                            metaInfo.createdOn = now();
                            return metaInfo;
                        }).then(() => executePromiseChain(this.getCallbacksFor('preExport'), [folderToExportFullPath, metaInfo]))
                        .then(() => {
                            // Write meta data to META.json
                            return this.file.writeFile(folderToExportFullPath, 'META.json', JSON.stringify(metaInfo));
                        });
                }).then(() => {
                    // Prepare name to use for the zip.
                    let appName = metaInfo.app.name;
                    appName = appName.replace(/\s+/g, '_');
                    return this.deviceFileService.newFileName(zipDirectory, appName + zipFileName)
                        .then(fileName => {
                            // Zip the temporary folder for export
                            return new Promise((rs, re) => {
                                Zeep.zip({
                                    from : folderToExportFullPath,
                                    to   : zipDirectory + fileName
                                }, () => rs(zipDirectory + fileName), re);
                            });
                        });
                }).then(resolve, reject)
                .catch(noop).then(() => {
                    // Remove temporary folder for export
                    return this.deviceFileService.removeDir(cordova.file.cacheDirectory + folderToExport);
                });
        });
    }

    /**
     *  returns store bound to the dataModelName and entityName.
     *
     * @param dataModelName
     * @param entityName
     * @returns {*}
     */
    public getStore(dataModelName: string, entityName: string): Promise<LocalDBStore> {
        return new Promise((resolve, reject) => {
            if (this.databases[dataModelName]) {
                resolve(this.databases[dataModelName].stores[entityName]);
            }
            reject(`store with name'${entityName}' in datamodel '${dataModelName}' is not found`);
        });
    }

    /**
     * This function will replace the databases with the files provided in zip. If import gets failed,
     * then app reverts back to use old databases.
     *
     * @param {string} zipPath location of the zip file.
     * @param {boolean} revertIfFails If true, then a backup is created and when import fails, backup is reverted back.
     * @returns {object} a promise that is resolved when zip is created.
     */
    public importDB(zipPath: string, revertIfFails: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const importFolder = 'offline_temp_' + now(),
                importFolderFullPath = cordova.file.cacheDirectory + importFolder + '/';
            let zipMeta;
            // Create a temporary folder to unzip the contents of the zip.
            this.file.createDir(cordova.file.cacheDirectory, importFolder, false)
                .then( () => {
                    return new Promise<void>((rs, re) => {
                        // Unzip to temporary location
                        Zeep.unzip({
                            from: zipPath,
                            to: importFolderFullPath
                        }, rs, re);
                    });
                }).then(() => {
                /*
                 * read meta data and allow import only package name of the app from which this zip is created
                 * and the package name of this app are same.
                 */
                return this.file.readAsText(importFolderFullPath, 'META.json')
                    .then(text => {
                    zipMeta = JSON.parse(text);
                    return this.getAppInfo();
                }).then(appInfo => {
                    if (!zipMeta.app) {
                        return Promise.reject('meta information is not found in zip');
                    }
                    if (zipMeta.app.packageName !== appInfo.packageName) {
                        return Promise.reject('database zip of app with same package name can only be imported');
                    }
                });
            }).then(() => {
                let backupZip;
                return this.close()
                    .then(() => {
                        if (revertIfFails) {
                            // create backup
                            return this.exportDB()
                                .then(path => backupZip = path);
                        }
                    }).then(() => {
                        // delete existing databases
                        return this.deviceFileService.removeDir(this.dbInstallDirectory);
                    }).then(() => {
                        // copy imported databases
                        return this.file.copyDir(importFolderFullPath, 'databases', this.dbInstallParentDirectory, this.dbInstallDirectoryName);
                    }).then(() => {
                        // reload databases
                        this.databases = null;
                        return this.loadDatabases();
                    }).then(() => executePromiseChain(this.getCallbacksFor('postImport'), [importFolderFullPath, zipMeta]))
                    .then(() => {
                        if (backupZip) {
                            return this.deviceFileService.removeFile(backupZip);
                        }
                    }, (reason) => {
                        if (backupZip) {
                            return this.importDB(backupZip, false)
                                .then(() => {
                                    this.deviceFileService.removeFile(backupZip);
                                    return Promise.reject(reason);
                                });
                        }
                        return Promise.reject(reason);
                    });
            }).then(resolve, reject)
            .catch(noop)
            .then(() => {
                return this.deviceFileService.removeDir(cordova.file.cacheDirectory + importFolder);
            });
        });
    }

    /**
     * @param {string} dataModelName Name of the data model
     * @param {string} entityName Name of the entity
     * @param {string} operation Name of the operation (READ, INSERT, UPDATE, DELETE)
     * @returns {boolean} returns true, if the given operation can be performed as per configuration.
     */
    public isOperationAllowed(dataModelName: string, entityName: string, operation: string): Promise<boolean> {
        return this.getStore(dataModelName, entityName).then( store => {
            if (!store) {
                return false;
            }
            if (operation === 'READ') {
                return store.entitySchema.pushConfig.readEnabled;
            }
            if (operation === 'INSERT') {
                return store.entitySchema.pushConfig.insertEnabled;
            }
            if (operation === 'UPDATE') {
                return store.entitySchema.pushConfig.updateEnabled;
            }
            if (operation === 'DELETE') {
                return store.entitySchema.pushConfig.deleteEnabled;
            }
            return false;
        }).catch(() => {
            return false;
        });
    }

    public loadDatabases(): Promise<any> {
        let newDatabasesCreated = false;
        if (this.databases) {
            return Promise.resolve(this.databases);
        } else {
            if (isIos()) {
                this.dbInstallDirectoryName = 'LocalDatabase';
                this.dbInstallParentDirectory = cordova.file.applicationStorageDirectory +  'Library/';
            } else {
                this.dbInstallDirectoryName = 'databases';
                this.dbInstallParentDirectory = cordova.file.applicationStorageDirectory;
            }
            this.dbInstallDirectory = this.dbInstallParentDirectory + this.dbInstallDirectoryName;

            this.databases = new Map<string, DBInfo>();
            return this.setUpDatabases()
                .then( flag => newDatabasesCreated = flag)
                .then(() => this.loadDBSchemas())
                .then(metadata => this.loadNamedQueries(metadata))
                .then(metadata => this.loadOfflineConfig(metadata))
                .then(metadata => {
                    return Promise.all(map(metadata, dbMetadata => {
                        return this.openDatabase(dbMetadata)
                            .then(database => {
                                this.databases[dbMetadata.schema.name] = database;
                            });
                    }));
                }).then(() => {
                    return this.getStore('wavemaker', 'key-value').then( store => {
                        this.localKeyValueService.init(store);
                        return this.localKeyValueService.get(NEXT_ID_COUNT).then(val => {
                           this.nextId = val || this.nextId;
                        });
                    });
                }).then(() => {
                    if (newDatabasesCreated) {
                        return this.normalizeData()
                            .then(() => this.disableForeignKeys())
                            .then(() => this.deviceService.getAppBuildTime())
                            .then(dbSeedCreationTime => {
                                return executePromiseChain(map(this.callbacks, 'onDbCreate'), [{
                                    'databases' : this.databases,
                                    'dbCreatedOn': now(),
                                    'dbSeedCreatedOn' : dbSeedCreationTime
                                }]);
                            }).then(() => this.databases);
                    } else {
                        return this.databases;
                    }
                });
        }
    }

    /**
     * using this function one can listen events such as onDbCreate, 'preExport' and 'postImport'.
     *
     * @param {object} listener an object with functions mapped to event names.
     */
    public registerCallback(listener: CallBack) {
        this.callbacks.push(listener);
    }

    public setLogSQl(flag: boolean) {
        this._logSql = flag;
    }

    /**
     * Deletes any existing databases (except wavemaker db) and copies the databases that are packaged with the app.
     *
     * @returns {*}
     */
    private cleanAndCopyDatabases(): Promise<any> {
        const dbSeedFolder = cordova.file.applicationDirectory + META_LOCATION;
        return this.file.createDir(this.dbInstallParentDirectory, this.dbInstallDirectoryName, false)
            .catch(noop)
            .then(() => this.deviceFileService.listFiles(this.dbInstallDirectory, /.+\.db$/))
            .then(files => {
                if (files && files.length > 0) {
                    return Promise.all(files.map(f => {
                        if (f['name'] !== 'wavemaker.db') {
                            return this.file.removeFile(this.dbInstallDirectory, f['name']);
                        }
                    }));
                }
            })
            .then( () => this.deviceFileService.listFiles(dbSeedFolder, /.+\.db$/))
            .then(files => {
                if (files && files.length > 0) {
                    return this.file.createDir(this.dbInstallParentDirectory, this.dbInstallDirectoryName, false)
                        .catch(noop)
                        .then(() => Promise.all(files.map(
                                f => this.file.copyFile(dbSeedFolder, f['name'], this.dbInstallDirectory, f['name'])
                            ))
                        );
                }
            });
    }

    // Picks essential details from the given schema.
    private compactEntitySchema(schema, entity, transformedSchemas): EntityInfo {
        const reqEntity = transformedSchemas[entity['entityName']] as EntityInfo;
        reqEntity.entityName = entity['entityName'];
        reqEntity.name = entity['name'];
        reqEntity.columns = [];
        entity.columns.forEach(col => {
            let defaultValue = col.columnValue ? col.columnValue.defaultValue : '';
            const type = col.sqlType;
            if (type === 'number' && !col.primaryKey) {
                defaultValue = isEmpty(defaultValue) ? null : parseInt(defaultValue);
            } else if (type === 'boolean') {
                defaultValue = isEmpty(defaultValue) ? null : (defaultValue === 'true' ? 1 : 0);
            } else {
                defaultValue = isEmpty(defaultValue) ? null : defaultValue;
            }
            reqEntity.columns.push({
                name: col['name'],
                fieldName: col['fieldName'],
                generatorType: col['generatorType'],
                sqlType: col['sqlType'],
                primaryKey: col['primaryKey'],
                defaultValue: defaultValue
            });
        });

        forEach(entity.relations, r => {
            let targetEntitySchema, targetEntity, col, sourceColumn, mapping;
            if (r.cardinality === 'ManyToOne' || r.cardinality === 'OneToOne') {
                targetEntity = find(schema.tables, t => t.name === r.targetTable);
                mapping = r.mappings[0];
                if (targetEntity) {
                    targetEntity = targetEntity.entityName;
                    sourceColumn = mapping.sourceColumn;
                    col = reqEntity.columns.find(column => column.name === sourceColumn);
                    targetEntitySchema = schema.tables.find(table => table.name === r.targetTable);
                    const foreignRelation = {
                        sourceFieldName: r.fieldName,
                        targetEntity: targetEntity,
                        targetTable: r.targetTable,
                        targetColumn: mapping.targetColumn,
                        targetPath: '',
                        dataMapper: [],
                        targetFieldName: targetEntitySchema.columns.find(column => column.name === mapping.targetColumn).fieldName
                    };
                    foreignRelation.targetPath = foreignRelation.sourceFieldName + '.' + foreignRelation.targetFieldName;
                    // @ts-ignore
                    foreignRelation.dataMapper = chain(targetEntitySchema.columns)
                        .keyBy(childCol => foreignRelation.sourceFieldName + '.' + childCol.fieldName)
                        .mapValues(childCol => new ColumnInfo(childCol.name, childCol.fieldName)).value();
                    col.foreignRelations = col.foreignRelations || [];
                    col.foreignRelations.push(foreignRelation);
                }
            }
        });
        return reqEntity;
    }

    // Loads necessary details of queries
    private compactQueries(queriesByDB): Map<string, NamedQueryInfo> {
        const queries = new Map<string, NamedQueryInfo>();

        forEach(queriesByDB.queries, queryData => {
            let query, params;
            if (queryData.nativeSql && queryData.type === 'SELECT') {
                query = isEmpty(queryData.offlineQueryString) ? queryData.queryString : queryData.offlineQueryString;
                params = map(this.extractQueryParams(query), p => {
                    const paramObj = find(queryData.parameters, {'name': p});
                    return {
                        name: paramObj.name,
                        type: paramObj.type,
                        variableType: paramObj.variableType
                    };
                });
                params.forEach(p => query = replace(query, ':' + p.name, '?'));
                queries[queryData.name] = {
                    name: queryData.name,
                    query: query,
                    params: params,
                    response: {
                        properties: map(queryData.response.properties, p => {
                            p.nameInUpperCase = p.name.toUpperCase();
                            return p;
                        })
                    }
                };
            }
        });
        return queries;
    }

    // Loads necessary details of remote schema
    private compactSchema(schema): DBInfo {
        const dbInfo = new DBInfo();
        const transformedSchemas = new Map<string, EntityInfo>();
        schema.tables.forEach(entitySchema => {
            transformedSchemas[entitySchema.entityName] = {};
        });
        schema.tables.forEach(entitySchema => {
            this.compactEntitySchema(schema, entitySchema, transformedSchemas);
        });
        dbInfo.schema.name = schema.name;
        dbInfo.schema.isInternal = schema.isInternal;
        dbInfo.schema.entities = transformedSchemas;
        return dbInfo;
    }

    private convertBoolToInt(bool: boolean) {
        return toString(bool) === 'true' ? 1 : 0;
    }

    private convertIntToBool(int: number) {
        return int ? true : false;
    }

    /**
     * Turns off foreign keys
     * @returns {*}
     */
    private disableForeignKeys() {
        // @ts-ignore
        return Promise.all(map(this.databases, db => this.executeSQLQuery(db.schema.name, 'PRAGMA foreign_keys = OFF')));
    }

    /**
     * Executes SQL query;
     *
     * @param dbName
     * @param sql
     * @param params
     * @returns {*}
     */
    public executeSQLQuery(dbName, sql, params?: any[], logOutput?: boolean) {
        const db = this.databases[dbName];
        if (db) {
            return db.sqliteObject.executeSql(sql, params, logOutput)
                .then(result => {
                    const data = [],
                        rows = result.rows;
                    for (let i = 0; i < rows.length; i++) {
                        data.push(rows.item(i));
                    }
                    return {
                        'rowsAffected'  : result.rowsAffected,
                        'rows'          : data
                    };
                });
        }
        return Promise.reject(`No Database with name ${dbName} found`);
    }

    // get the params of the query or procedure.
    private extractQueryParams(query) {
        let params, aliasParams;
        aliasParams = query.match(/[^"'\w\\]:\s*\w+\s*/g) || [];
        if (aliasParams.length) {
            params = aliasParams.map(x => (/[=|\W]/g.test(x)) ? x.replace(/\W/g, '').trim() : x.trim());
        } else {
            params = null;
        }
        return params;
    }

    /**
     * Returns a promise that is resolved with application info such as packageName, appName, versionNumber, versionCode.
     * @returns {*}
     */
    private getAppInfo() {
        const appInfo = {
            name: '',
            packageName: '',
            versionNumber: '',
            versionCode: null
        };
        return this.appVersion.getPackageName()
            .then(packageName => {
                appInfo.packageName = packageName;
                return this.appVersion.getAppName();
            }).then(appName => {
                appInfo.name = appName;
                return this.appVersion.getVersionNumber();
            }).then(versionNumber => {
                appInfo.versionNumber = versionNumber;
                return this.appVersion.getVersionCode();
            }).then(versionCode => {
                appInfo.versionCode = (versionCode as any);
                return appInfo;
            });
    }

    private getCallbacksFor(event: string): any[] {
        return this.callbacks.map(c => {
            if (c[event]) {
                return c[event].bind(c);
            }
            return null;
        });
    }

    /**
     * Searches for the files with given regex in 'www/metadata/app'and returns an array that contains the JSON
     * content present in each file.
     *
     * @param {string} fileNameRegex regex pattern to search for files.
     * @returns {*} A promise that is resolved with an array
     */
    private getMetaInfo(fileNameRegex: RegExp) {
        const folder = cordova.file.applicationDirectory + META_LOCATION + '/';
        return this.deviceFileService.listFiles(folder, fileNameRegex)
            .then(files => Promise.all(map(files, f => {
                    return new Promise((resolve, reject) => {
                        // Cordova File reader has buffer issues with large files.
                        // so, using ajax to retrieve local json
                        $.getJSON(transformFileURI(folder) + f['name'], data => resolve(data));
                    });
                }))
            );
    }

    /**
     * Returns true, if the given entity's data is bundled along with application installer.
     * @param dataModelName name of the data model
     * @param entityName name of the entity
     * @returns {Promise<any>}
     */
    public isBundled(dataModelName, entityName): Promise<any> {
        return this.getStore(dataModelName, entityName).then(store => {
            return store.entitySchema.pullConfig.pullType === PullType.BUNDLED;
        });
    }

    /**
     * Loads local database schemas from *_data_model.json.
     *
     * @returns {*} A promise that is resolved with metadata.
     */
    private loadDBSchemas(): Promise<Map<string, DBInfo>> {
        return this.getMetaInfo(/.+_dataModel\.json$/)
            .then( (schemas: any) => {
                const metadata = new Map<string, DBInfo>();
                schemas = isArray(schemas) ? schemas : [schemas];
                schemas.push(OFFLINE_WAVEMAKER_DATABASE_SCHEMA);
                schemas.map(s => this.compactSchema(s))
                    .forEach(s =>  {
                        metadata[s.schema.name] = s;
                    });
                return metadata;
            });
    }

    /**
     * Load named queries from *_query.json.
     *
     * @param {*} metadata
     * @returns {*} A promise that is resolved with metadata
     */
    private loadNamedQueries(metadata) {
        return this.getMetaInfo(/.+_query\.json$/)
            .then((queriesByDBs: any) => {
                queriesByDBs = isArray(queriesByDBs) ? queriesByDBs : [queriesByDBs];
                queriesByDBs.map(e => metadata[e.name].queries = this.compactQueries(e));
                return metadata;
            });
    }

    /**
     * Load offline configuration from *_offline.json.
     *
     * @param {*} metadata
     * @returns {*} A promise that is resolved with metadata
     */
    private loadOfflineConfig(metadata) {
        return this.getMetaInfo(/.+_offline\.json$/)
            .then(configs => {
                forEach(configs, config => {
                    // @ts-ignore
                    forEach(config.entities, entityConfig => {
                        // @ts-ignore
                        const entitySchema = find(metadata[config.name].schema.entities, schema => schema.name === entityConfig.name);
                        assignIn(entitySchema, entityConfig);
                    });
                });
                return metadata;
            });
    }

    private logSql(sqliteObject: SQLiteObject) {
        const logger = console,
            originalExecuteSql = sqliteObject.executeSql;
        sqliteObject.executeSql = (sql, params, logOutput?: boolean) => {
            const startTime = now();
            return originalExecuteSql.call(sqliteObject, sql, params).then(result => {
                if (logOutput || this._logSql) {
                    const objArr = [],
                        rowCount = result.rows.length;
                    for (let i = 0; i < rowCount; i++) {
                        objArr.push(result.rows.item(i));
                    }
                    logger.debug('SQL "%s"  with params %O took [%d ms]. And the result is %O', sql, params, now() - startTime, objArr);
                }
                return result;
            }, error => {
                logger.error('SQL "%s" with params %O failed with error message %s', sql, params, error.message);
                return Promise.reject(error);
            });
        };
    }

    /**
     * SQLite does not support boolean data. Instead of using boolean values, data will be changed to 0 or 1.
     * If the value is 'true', then 1 is set as value. If value is not 1 nor null, then column value is set as 0.
     * @param dbName
     * @param tableName
     * @param colName
     * @returns {*}
     */
    private normalizeBooleanData(dbName, tableName, colName) {
        const trueTo1Query = `update ${escapeName(tableName)} set ${escapeName(colName)} = 1 where ${escapeName(colName)} = 'true'`,
            exceptNullAnd1to0Query = `update ${escapeName(tableName)} set ${escapeName(colName)} = 0
                                  where ${escapeName(colName)} is not null and ${escapeName(colName)} != 1`;
        return this.executeSQLQuery(dbName, trueTo1Query)
            .then(() => this.executeSQLQuery(dbName, exceptNullAnd1to0Query));
    }

    /**
     * Converts data to support SQLite.
     * @returns {*}
     */
    private normalizeData() {
        return Promise.all(map(this.databases, database => {
            // @ts-ignore
            return Promise.all(map(database.schema.entities, entitySchema => {
                return Promise.all(map(entitySchema.columns, column => {
                    if (column.sqlType === 'boolean') {
                        // @ts-ignore
                        return this.normalizeBooleanData(database.schema.name, entitySchema.name, column.name);
                    }
                }));
            }));
        }));
    }

    private openDatabase(database: DBInfo) {
        return this.sqlite.create({
                name: database.schema.name + '.db',
                location: 'default'
        }).then(sqliteObject => {
            database.sqliteObject = sqliteObject;
            this.logSql(sqliteObject);
            const storePromises = map(database.schema.entities, entitySchema => {
                // @ts-ignore
                const store = new LocalDBStore(this.deviceFileService, entitySchema,
                    this.file,
                    this,
                    sqliteObject
                    );
                return store.create();
            });
            return Promise.all(storePromises).then(stores => {
                forEach(stores, store => {
                    database.stores[store.entitySchema.entityName] = store;
                });
                return database;
            });
        });
    }

    /**
     * When app is opened for first time  after a fresh install or update, then old databases are removed and
     * new databases are created using bundled databases.
     *
     * @returns {*} a promise that is resolved with true, if the databases are newly created or resolved with false
     * if existing databases are being used.
     */
    private setUpDatabases(): Promise<boolean> {
        return this.deviceService.getAppBuildTime()
            .then((buildTime) => {
                const dbInfo = this.deviceService.getEntry('database') || {};
                if (!dbInfo.lastBuildTime || dbInfo.lastBuildTime !== buildTime) {
                    return this.cleanAndCopyDatabases()
                        .then(() => {
                            dbInfo.lastBuildTime = buildTime;
                            return this.deviceService.storeEntry('database', dbInfo);
                        }).then(() => true);
                }
                return false;
            });
    }
}
