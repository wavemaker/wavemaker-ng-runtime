import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';
import { SQLite } from '@ionic-native/sqlite';
import { now } from 'moment';

import { executePromiseChain, isArray, isIos, noop } from '@wm/core';
import { DeviceFileService } from '@wm/mobile/core';

import { LocalKeyValueService } from './local-key-value.service';
import { LocalDBStore } from '../models/local-db-store';
import { escapeName } from '../utils/utils';
import { ColumnInfo, DBInfo, EntityInfo, NamedQueryInfo } from '../models/config';

declare const _;
declare const cordova;

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
                generatorType : 'identity',
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
                generatorType: 'identity',
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

@Injectable()
export class LocalDBManagementService {

    private callbacks: any[];
    private dbInstallDirectory: string;
    private dbInstallDirectoryName: string;
    private dbInstallParentDirectory: string;
    private databases: Map<string, DBInfo>;

    constructor(
        private deviceFileService: DeviceFileService,
        private file: File,
        private localKeyValueService: LocalKeyValueService,
        private sqlite: SQLite
    ) {}

    /**
     *  returns store bound to the dataModelName and entityName.
     *
     * @param dataModelName
     * @param entityName
     * @returns {*}
     */
    public getStore(dataModelName, entityName) {
        if (this.databases[dataModelName]) {
            return this.databases[dataModelName].stores[entityName];
        }
        return null;
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
                    return Promise.all(_.map(metadata, dbMetadata => {
                        return this.openDatabase(dbMetadata)
                            .then(database => {
                                this.databases[dbMetadata.schema.name] = database;
                            });
                    }));
                }).then(() => {
                    this.localKeyValueService.init(this.getStore('wavemaker', 'key-value'));
                    if (newDatabasesCreated) {
                        return this.normalizeData()
                            .then(() => this.disableForeignKeys())
                            .then(() => this.getDBSeedCreationTime())
                            .then(dbSeedCreationTime => {
                                return executePromiseChain(_.map(this.callbacks, 'onDbCreate'), [{
                                    'databases' : this.databases,
                                    'dbCreatedOn' : _.now(),
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
     * @param {object} listeners an object with functions mapped to event names.
     */
    public registerCallback(listeners) {
        this.callbacks.push(listeners);
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
                defaultValue = _.isEmpty(defaultValue) ? 0 : _.parseInt(defaultValue);
            } else if (type === 'boolean') {
                defaultValue = _.isEmpty(defaultValue) ? null : (defaultValue === 'true' ? 1 : 0);
            } else {
                defaultValue = _.isEmpty(defaultValue) ? null : defaultValue;
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

        _.forEach(entity.relations, r => {
            let targetEntitySchema, targetEntity, col, sourceColumn, mapping;
            if (r.cardinality === 'ManyToOne' || r.cardinality === 'OneToOne') {
                targetEntity = _.find(schema.tables, t => t.name === r.targetTable);
                mapping = r.mappings[0];
                if (targetEntity) {
                    targetEntity = targetEntity.entityName;
                    sourceColumn = mapping.sourceColumn;
                    col = reqEntity.columns.find(column => column.name === sourceColumn);
                    targetEntitySchema = schema.tables.find(table => table.name === r.targetTable);
                    col.foreignRelaton = {
                        sourceFieldName: r.fieldName,
                        targetEntity: targetEntity,
                        targetTable: r.targetTable,
                        targetColumn: mapping.targetColumn,
                        targetFieldName: targetEntitySchema.columns.find(column => column.name === mapping.targetColumn).fieldName
                    };
                    col.foreignRelaton.targetPath = col.foreignRelaton.sourceFieldName + '.' + col.foreignRelaton.targetFieldName;
                    col.foreignRelaton.dataMapper = _.chain(targetEntitySchema.columns)
                        .keyBy(childCol => col.foreignRelaton.sourceFieldName + '.' + childCol.fieldName)
                        .mapValues(childCol => new ColumnInfo(childCol.name, childCol.fieldName)).value();
                }
            }
        });
        return reqEntity;
    }

    // Loads necessary details of queries
    private compactQueries(queriesByDB): Map<string, NamedQueryInfo> {
        const queries = new Map<string, NamedQueryInfo>();

        _.forEach(queriesByDB.queries, queryData => {
            let query, params;
            if (queryData.nativeSql && !queryData.update) {
                query = queryData.queryString;
                params = this.extractQueryParams(query).map(p => {
                    const paramObj = _.find(queryData.parameters, {'name': p});
                    return {
                        name: paramObj.name,
                        type: paramObj.type,
                        variableType: paramObj.variableType
                    };
                });
                params.forEach(p => query = _.replace(query, ':' + p.name, '?'));
                queries[queryData.name] = {
                    name: queryData.name,
                    query: query,
                    params: params,
                    response: {
                        properties: _.map(queryData.response.properties, p => {
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

    /**
     * Turns off foreign keys
     * @returns {*}
     */
    private disableForeignKeys() {
        return Promise.all(_.map(this.databases, db =>
            this.executeSQLQuery(db.schema.name, 'PRAGMA foreign_keys = OFF')
        ));
    }

    /**
     * Executes SQL query;
     *
     * @param dbName
     * @param sql
     * @param params
     * @returns {*}
     */
    private executeSQLQuery(dbName, sql, params?: any[]) {
        const db = this.databases[dbName];
        if (db) {
            return db.connection.executeSql(sql, params)
                .then(function (result) {
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
            params = aliasParams.map(
                function (x) {
                    return (/[=|\W]/g.test(x)) ? x.replace(/\W/g, '').trim() : x.trim();
                }
            );
        } else {
            params = null;
        }
        return params;
    }

    /**
     * Returns the timestamp when the seed db is created
     * @returns {*}
     */
    private getDBSeedCreationTime() {
        return this.file.readAsText(cordova.file.applicationDirectory + 'www', 'config.json')
            .then(function (appConfig) {
                return JSON.parse(appConfig).buildTime;
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
        const folder = cordova.file.applicationDirectory + META_LOCATION;
        return this.deviceFileService.listFiles(folder, fileNameRegex)
            .then(files => Promise.all(_.map(files,
                f => this.file.readAsText(folder, f['name']).then(JSON.parse)))
            );
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
                queriesByDBs = _.isArray(queriesByDBs) ? queriesByDBs : [queriesByDBs];
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
                _.forEach(configs, config => {
                    _.forEach(config.entities, entityConfig => {
                        const entitySchema = metadata[config.name].schema.entities[entityConfig.name];
                        _.assignIn(entitySchema, entityConfig);
                    });
                });
                return metadata;
            });
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
        return Promise.all(_.map(this.databases, database => {
            return Promise.all(_.map(database.schema.entities, entitySchema => {
                return Promise.all(_.map(entitySchema.columns, column => {
                    if (column.sqlType === 'boolean') {
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
            const storePromises = _.map(database.schema.entities, entitySchema => {
                return new LocalDBStore(this.deviceFileService,
                    entitySchema,
                    this.file,
                    sqliteObject);
            });
            return Promise.all(storePromises).then(stores => {
                _.forEach(stores, function (store) {
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
        return this.getDBSeedCreationTime()
            .then((dbSeedCreationTime) => {
                let appInfo;
                return this.file.readAsText(cordova.file.dataDirectory, 'app.info')
                    .then(content =>  appInfo = JSON.parse(content), noop)
                    .then(() => !appInfo || appInfo.createdOn < dbSeedCreationTime)
                    .then( cleanAndCreate => {
                        if (cleanAndCreate) {
                            return this.cleanAndCopyDatabases()
                                .then(() => {
                                    appInfo = appInfo || {};
                                    appInfo.createdOn = dbSeedCreationTime || now();
                                    return this.file.writeFile(cordova.file.dataDirectory,
                                        'app.info',
                                        JSON.stringify(appInfo),
                                        { replace: true });
                                }).then(() => true);
                        }
                        return cleanAndCreate;
                    });
            });
    }
}