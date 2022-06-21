import { File } from '@awesome-cordova-plugins/file/ngx';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

import { convertToBlob, isDefined } from '@wm/core';
import { DeviceFileService } from '@wm/mobile/core';
import { SWAGGER_CONSTANTS } from '@wm/variables';

import { ColumnInfo, EntityInfo } from './config';
import { escapeName } from '../utils/utils';
import { LocalDBManagementService } from '../services/local-db-management.service';

declare const _;

export interface FilterCriterion {
    attributeName: string;
    attributeValue: any;
    attributeType: string;
    filterCondition: string;
}

export interface Pagination {
    offset: number;
    limit: number;
}

const insertRecordSqlTemplate = (schema: EntityInfo) => {
    const columnNames = [],
        placeHolder = [];
    _.forEach(schema.columns, col => {
        columnNames.push(escapeName(col.name));
        placeHolder.push('?');
    });
    return `INSERT INTO ${escapeName(schema.name)} (${columnNames.join(',')}) VALUES (${placeHolder.join(',')})`;
};

const replaceRecordSqlTemplate = (schema: EntityInfo) => {
    const columnNames = [],
        placeHolder = [];
    _.forEach(schema.columns, col => {
        columnNames.push(escapeName(col.name));
        placeHolder.push('?');
    });
    return `REPLACE INTO ${escapeName(schema.name)} (${columnNames.join(',')}) VALUES (${placeHolder.join(',')})`;
};

const deleteRecordTemplate = (schema: EntityInfo) => {
    const primaryKeyField = _.find(schema.columns, 'primaryKey');
    if (primaryKeyField) {
        return `DELETE FROM ${escapeName(schema.name)} WHERE ${escapeName(primaryKeyField.name)} = ?`;
    }
    return '';
};

const selectSqlTemplate = (schema: EntityInfo) => {
    const columns = [],
        joins = [];
    schema.columns.forEach( col => {
        let childTableName;
        columns.push(escapeName(schema.name) + '.' + escapeName(col.name) + ' as ' + col.fieldName);
        if (col.foreignRelations) {
            col.foreignRelations.forEach(foreignRelation => {
                childTableName = foreignRelation.sourceFieldName;
                _.forEach(foreignRelation.dataMapper, (childCol, childFiledName) => {
                    columns.push(childTableName + '.' + escapeName(childCol.name) + ' as \'' + childFiledName + '\'');
                });
                joins.push(` LEFT JOIN ${escapeName(foreignRelation.targetTable)} ${childTableName}
                         ON ${childTableName}.${escapeName(foreignRelation.targetColumn)} = ${escapeName(schema.name)}.${escapeName(col.name)}`);
            });
        }
    });
    return `SELECT ${columns.join(',')} FROM ${escapeName(schema.name)} ${joins.join(' ')}`;
};

const countQueryTemplate = (schema: EntityInfo) => {
    const joins = [];
    schema.columns.forEach( col => {
        let childTableName;
        if (col.foreignRelations) {
            col.foreignRelations.forEach(foreignRelation => {
                childTableName = foreignRelation.sourceFieldName;
                joins.push(` LEFT JOIN ${escapeName(foreignRelation.targetTable)} ${childTableName}
                         ON ${childTableName}.${escapeName(foreignRelation.targetColumn)} = ${escapeName(schema.name)}.${escapeName(col.name)}`);
            });
        }
    });
    return `SELECT count(*) as count FROM ${escapeName(schema.name)} ${joins.join(' ')}`;
};

const generateWherClause = (store: LocalDBStore, filterCriteria: FilterCriterion[]) => {
    let conditions;
    const fieldToColumnMapping = store.fieldToColumnMapping,
        tableName = store.entitySchema.name;
    if (!_.isEmpty(filterCriteria) && _.isString(filterCriteria)) {
        return ' WHERE ' + filterCriteria;
    }
    if (filterCriteria) {
        conditions = filterCriteria.map(filterCriterion => {
            const colName = fieldToColumnMapping[filterCriterion.attributeName],
                condition = filterCriterion.filterCondition;
            let target = filterCriterion.attributeValue,
                operator = '=';
            if (filterCriterion.attributeType === 'STRING') {
                if (condition === 'STARTING_WITH') {
                    target = target + '%';
                    operator = 'like';
                } else if (condition === 'ENDING_WITH') {
                    target = '%' + target;
                    operator = 'like';
                } else if (condition === 'CONTAINING') {
                    target = '%' + target + '%';
                    operator = 'like';
                }
                target = `'${target}'`;
            } else if (filterCriterion.attributeType === 'BOOLEAN') {
                target = (target === true ? 1 : 0);
            }
            return `${escapeName(tableName)}.${escapeName(colName)} ${operator} ${target}`;
        });
    }
    return conditions && conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
};

const generateOrderByClause = (store: LocalDBStore, sort: string) => {
    if (sort) {
        return ' ORDER BY ' + _.map(sort.split(','), field => {
            const splits =  _.trim(field).split(' ');
            splits[0] = escapeName(store.entitySchema.name) + '.' + escapeName(store.fieldToColumnMapping[splits[0]]);
            return splits.join(' ');
        }).join(',');
    }
    return '';
};

const geneateLimitClause = page => {
    page = page || {};
    return ' LIMIT ' + (page.limit || 100) + ' OFFSET ' + (page.offset || 0);
};

const mapRowDataToObj = (schema: EntityInfo, dataObj: any) => {
    schema.columns.forEach(col => {
        const val = dataObj[col.fieldName];
        if (col.foreignRelations) {
            col.foreignRelations.forEach(foreignRelation => {
                let childEntity = null;
                _.forEach(foreignRelation.dataMapper, function (childCol, childFieldName) {
                    const fieldValue = dataObj[childFieldName];
                    if (isDefined(fieldValue) && fieldValue !== null && fieldValue !== '') {
                        childEntity = childEntity || {};
                        childEntity[childCol.fieldName] = dataObj[childFieldName];
                    }
                    delete dataObj[childFieldName];
                });
                dataObj[foreignRelation.sourceFieldName] = childEntity;
            });
        } else if (col.sqlType === 'boolean' && !_.isNil(val)) {
            dataObj[col.fieldName] = (val === 1);
        }
    });
    return dataObj;
};

const getValue = (entity: any, col: ColumnInfo) => {
    let value = entity[col.fieldName];
    if (col.foreignRelations) {
        col.foreignRelations.some(foreignRelation => {
            if (foreignRelation.targetEntity && entity[foreignRelation.sourceFieldName]) {
                value = entity[foreignRelation.sourceFieldName][foreignRelation.targetFieldName];
                return true;
            }
            return false;
        });
    }
    if (_.isNil(value)) {
        return col.defaultValue;
    } else if (col.sqlType === 'boolean') {
        return (value === true ? 1 : 0);
    } else {
        return value;
    }
};

const mapObjToRow = (store: LocalDBStore, entity: any) => {
    const row = {};
    store.entitySchema.columns.forEach(col => row[col.name] = getValue(entity, col));
    return row;
};

export class LocalDBStore {

    public readonly primaryKeyField: ColumnInfo;
    public readonly primaryKeyName: string;
    public readonly fieldToColumnMapping: object = {};

    private insertRecordSqlTemplate: string;
    private replaceRecordSqlTemplate: string;
    private deleteRecordTemplate: string;
    private selectSqlTemplate: string;
    private countQuery: string;

    constructor(
        private deviceFileService: DeviceFileService,
        public readonly entitySchema: EntityInfo,
        private file: File,
        private localDbManagementService: LocalDBManagementService,
        private sqliteObject: SQLiteObject
    ) {
        this.primaryKeyField = _.find(this.entitySchema.columns, 'primaryKey');
        this.primaryKeyName = this.primaryKeyField ? this.primaryKeyField.fieldName : undefined;
        this.entitySchema.columns.forEach(c => {
            this.fieldToColumnMapping[c.fieldName] = c.name;
            if (c.foreignRelations) {
                c.foreignRelations.forEach( foreignRelation => {
                    this.fieldToColumnMapping[foreignRelation.targetPath] = c.name;
                    _.forEach(foreignRelation.dataMapper, (childCol, childFieldName) => {
                        this.fieldToColumnMapping[childFieldName] = foreignRelation.sourceFieldName + '.' + childCol.name;
                    });
                });
            }
        });

        this.insertRecordSqlTemplate = insertRecordSqlTemplate(this.entitySchema);
        this.replaceRecordSqlTemplate = replaceRecordSqlTemplate(this.entitySchema);
        this.deleteRecordTemplate = deleteRecordTemplate(this.entitySchema);
        this.selectSqlTemplate = selectSqlTemplate(this.entitySchema);
        this.countQuery = countQueryTemplate(this.entitySchema);
    }

    public add(entity: any): Promise<any> {
        if (this.primaryKeyName) {
            const idValue = entity[this.primaryKeyName];
            if (this.primaryKeyField.sqlType === 'number'
                && (!isDefined(idValue) || (_.isString(idValue) && _.isEmpty(_.trim(idValue))))) {
                if (this.primaryKeyField.generatorType === 'identity') {
                    // updating the id with the latest id obtained from nextId.
                    entity[this.primaryKeyName] = this.localDbManagementService.nextIdCount();
                } else {
                    // for assigned type, get the primaryKeyValue from the relatedTableData which is inside the entity
                    const primaryKeyValue = this.getValue(entity, this.primaryKeyName);
                    entity[this.primaryKeyName] = primaryKeyValue;
                }
            }
        }
        const rowData = mapObjToRow(this, entity);
        const params = this.entitySchema.columns.map(f => rowData[f.name]);
        return this.sqliteObject.executeSql(this.insertRecordSqlTemplate, params)
            .then(result => result.insertId);
    }

    /**
     * clears all data of this store.
     * @returns {object} promise
     */
    public clear(): Promise<any> {
        return this.sqliteObject.executeSql('DELETE FROM ' + escapeName(this.entitySchema.name));
    }

    /**
     * creates the stores if it does not exist
     * @returns {Promise<any>}
     */
    public create(): Promise<any> {
        return this.sqliteObject.executeSql(this.createTableSql(this.entitySchema)).then(() => this);
    }

    /**
     * counts the number of records that satisfy the given filter criteria.
     * @param {FilterCriterion[]} filterCriteria
     * @returns {object} promise that is resolved with count
     */
    public count(filterCriteria?: FilterCriterion[]): Promise<number> {
        const sql = this.countQuery + generateWherClause(this, filterCriteria);
        return this.sqliteObject.executeSql(sql).then(result => result.rows.item(0)['count']);
    }

    /**
     * This function deserializes the given map object to FormData, provided that map object was
     * serialized by using serialize method of this store.
     * @param  {object} map object to deserialize
     * @returns {object} promise that is resolved with the deserialized FormData.
     */
    public deserialize(map: any) {
        return this.deserializeMapToFormData(map);
    }

    /**
     * filters data of this store that statisfy the given filter criteria.
     * @param {FilterCriterion[]} filterCriteria
     * @param  {string=} sort ex: 'filedname asc/desc'
     * @param  {object=} page {'offset' : 0, "limit" : 20}
     * @returns {object} promise that is resolved with the filtered data.
     */
    public filter(filterCriteria?: FilterCriterion[], sort?: string, page?: Pagination): Promise<any[]> {
        let sql = this.selectSqlTemplate;
        sql += generateWherClause(this, filterCriteria);
        sql += generateOrderByClause(this, sort);
        sql += geneateLimitClause(page);
        return this.sqliteObject.executeSql(sql)
            .then(result => {
            const objArr = [],
                rowCount = result.rows.length;
            for (let i = 0; i < rowCount; i++) {
                objArr.push(mapRowDataToObj(this.entitySchema, result.rows.item(i)));
            }
            return objArr;
        });
    }

    // fetches all the data related to the primaryKey
    public refresh(data) {
        const primaryKeyName = this.primaryKeyName;
        const primaryKey = this.getValue(data, primaryKeyName);
        if (!primaryKey) {
            return Promise.resolve(data);
        }
        return this.get(primaryKey);
    }

    /**
     * deletes the record with the given primary key.
     * @param  {object} primaryKey primary key of the record
     * @returns {object} promise
     */
    public delete(primaryKey: any) {
        return this.sqliteObject.executeSql(this.deleteRecordTemplate, [primaryKey]);
    }

    /**
     * finds the record with the given primary key.
     * @param  {object} primaryKey primary key of the record
     * @returns {object} promise that is resolved with entity
     */
    public get(primaryKey: any) {
        const filterCriteria = [{
            attributeName: this.primaryKeyName,
            filterCondition: '=',
            attributeValue: primaryKey,
            attributeType: this.primaryKeyField.sqlType.toUpperCase() }];
        return this.filter(filterCriteria).then(function (obj) {
            return obj && obj.length === 1 ? obj[0] : undefined;
        });
    }

    /**
     * retrieve the value for the given field.
     *
     * @param entity
     * @param {string} fieldName
     * @returns {undefined | any | number}
     */
    public getValue(entity: any, fieldName: string) {
        const column = this.entitySchema.columns.find( col => col.fieldName === fieldName);
        return getValue(entity, column);
    }

    /**
     * saves the given entity to the store. If the record is not available, then a new record will be created.
     * @param {object} entity the entity to save
     * @returns {object} promise
     */
    public save(entity) {
        return this.saveAll([entity]);
    }

    /**
     * saves the given entity to the store. If the record is not available, then a new record will be created.
     * @param {object} entities the entity to save
     * @returns {object} promise
     */
    public saveAll(entities: any[]) {
        // filtering the null entities
        entities = _.filter(entities, null);
        const queries = _.map(entities, entity => {
            const rowData = mapObjToRow(this, entity);
            const params = this.entitySchema.columns.map(f => rowData[f.name]);
            return [this.replaceRecordSqlTemplate, params];
        });
        return this.sqliteObject.sqlBatch(queries);
    }

    /**
     * Based on this store columns, this function converts the given FormData to a map object.
     * Multipart file is stored as a local file. If form data cannot be serialized,
     * then formData is returned back.
     * @param  {FormData} formData object to serialize
     * @returns {object} promise that is resolved with a map.
     */
    public serialize(formData: any) {
        return this.serializeFormDataToMap(formData);
    }

    /**
     * Save blob to a local file
     * @param blob
     * @returns {*}
     */
    private saveBlobToFile(blob: any) {
        const fileName = this.deviceFileService.appendToFileName(blob.name),
            uploadDir = this.deviceFileService.getUploadDirectory();
        return this.file.writeFile(uploadDir, fileName, blob).then(function () {
            return {
                'name' : blob.name,
                'type' : blob.type,
                'lastModified' : blob.lastModified,
                'lastModifiedDate' : blob.lastModifiedDate,
                'size' : blob.size,
                'wmLocalPath' : uploadDir + '/' + fileName
            };
        });
    }

    /**
     * Converts form data object to map for storing request in local database..
     */
    private serializeFormDataToMap(formData) {
        const blobColumns = _.filter(this.entitySchema.columns, {
                'sqlType' : 'blob'
            }),
            promises = [];
        let map = {};
        if (formData && typeof formData.append === 'function' && formData.rowData) {
            _.forEach(formData.rowData, (fieldData, fieldName) => {
                if (fieldData && _.find(blobColumns, {'fieldName' : fieldName})) {
                    promises.push(this.saveBlobToFile(fieldData).then(localFile => {
                        map[fieldName] = localFile;
                    }));
                } else {
                    map[fieldName] = fieldData;
                }
            });
        } else {
            map = formData;
        }
        return Promise.all(promises).then(() => map);
    }

    /**
     * Converts map object back to form data.
     */
    private deserializeMapToFormData(map) {
        const formData = new FormData(),
            blobColumns = this.entitySchema.columns.filter(c => c.sqlType === 'blob'),
            promises = [];
        _.forEach(blobColumns, column => {
            const value = map[column.fieldName];
            if (value && value.wmLocalPath) {
                promises.push(convertToBlob(value.wmLocalPath)
                    .then(result => formData.append(column.fieldName, result.blob, value.name)));
                map[column.fieldName] = '';
            }
        });
        formData.append(SWAGGER_CONSTANTS.WM_DATA_JSON, new Blob([JSON.stringify(map)], {
            type: 'application/json'
        }));
        return Promise.all(promises).then(() => formData);
    }

    private createTableSql(schema) {
        const fieldStr = _.reduce(schema.columns, (result, f) => {
            let str = escapeName(f.name);
            if (f.primaryKey) {
                if (f.sqlType === 'number' && f.generatorType === 'databaseIdentity') {
                    str += ' INTEGER PRIMARY KEY AUTOINCREMENT';
                } else {
                    str += ' PRIMARY KEY';
                }
            }
            return result ? result + ',' + str : str;
        }, false);
        return `CREATE TABLE IF NOT EXISTS ${escapeName(schema.name)} (${fieldStr})`;
    }
}
