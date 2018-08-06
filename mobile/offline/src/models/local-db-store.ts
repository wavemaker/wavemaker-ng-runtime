import { File } from '@ionic-native/file';
import { SQLiteObject } from '@ionic-native/sqlite';

import { convertToBlob } from '@wm/core';
import { DeviceFileService } from '@wm/mobile/core';
import { SWAGGER_CONSTANTS } from '@wm/variables';

import { ColumnInfo, EntityInfo } from './config';
import { escapeName } from '../utils/utils';

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

const selectSqlTemplate = (schema) => {
    const columns = [],
        joins = [];
    schema.columns.forEach( col => {
        let childTableName;
        columns.push(escapeName(schema.name) + '.' + escapeName(col.name) + ' as ' + col.fieldName);
        if (col.targetEntity) {
            childTableName = col.sourceFieldName;
            _.forEach(col.dataMapper, (childCol, childFiledName) => {
                columns.push(childTableName + '.' + escapeName(childCol.name) + ' as \'' + childFiledName + '\'');
            });
            joins.push(` LEFT JOIN ${escapeName(col.targetTable)} ${childTableName}
                         ON ${childTableName}.${escapeName(col.targetColumn)} = ${escapeName(schema.name)}.${escapeName(col.name)}`);
        }
    });
    return `SELECT ${columns.join(',')} FROM ${escapeName(schema.name)} ${joins.join(' ')}`;
};

const countQueryTemplate = (schema) => {
    const joins = [];
    schema.columns.forEach( col => {
        let childTableName;
        if (col.targetEntity) {
            childTableName = col.sourceFieldName;
            joins.push(` LEFT JOIN ${escapeName(col.targetTable)} ${childTableName}
                         ON ${childTableName}.${escapeName(col.targetColumn)} = ${escapeName(schema.name)}.${escapeName(col.name)}`);
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
        let childEntity;
        const val = dataObj[col.fieldName];
        if (col.foreignRelaton) {
            _.forEach(col.foreignRelaton.dataMapper, function (childCol, childFieldName) {
                if (dataObj[childFieldName]) {
                    childEntity = childEntity || {};
                    childEntity[childCol.fieldName] = dataObj[childFieldName];
                }
                delete dataObj[childFieldName];
            });
            dataObj[col.foreignRelaton.sourceFieldName] = childEntity;
        } else if (col.sqlType === 'boolean' && !_.isNil(val)) {
            dataObj[col.fieldName] = (val === 1);
        }
    });
    return dataObj;
};

const mapObjToRow = (store: LocalDBStore, entity: any) => {
    const row = {};
    store.entitySchema.columns.forEach(col => {
        const value = entity[col.fieldName];
        if (col.foreignRelaton && col.foreignRelaton.targetEntity && entity[col.foreignRelaton.sourceFieldName]) {
            row[col.name] = entity[col.foreignRelaton.sourceFieldName][col.foreignRelaton.targetFieldName];
        } else if (_.isNil(value)) {
            row[col.name] = col.defaultValue;
        } else if (col.sqlType === 'boolean') {
            row[col.name] = (value === true ? 1 : 0);
        } else {
            row[col.name] = value;
        }
    });
    return row;
};

export class LocalDBStore {

    public readonly primaryKeyField: ColumnInfo;
    public readonly primaryKeyName: string;
    public readonly fieldToColumnMapping = new Map<string, string>();

    private insertRecordSqlTemplate: string;
    private replaceRecordSqlTemplate: string;
    private deleteRecordTemplate: string;
    private selectSqlTemplate: string;
    private countQuery: string;

    constructor(
        private deviceFileService: DeviceFileService,
        public readonly entitySchema: EntityInfo,
        private file: File,
        private sqliteObject: SQLiteObject
    ) {
        this.primaryKeyField = _.find(this.entitySchema.columns, 'primaryKey');
        this.primaryKeyName = this.primaryKeyField ? this.primaryKeyField.fieldName : undefined;
        this.entitySchema.columns.forEach(c => {
            this.fieldToColumnMapping[c.fieldName] = c.name;
            if (c.foreignRelaton) {
                this.fieldToColumnMapping[c.foreignRelaton.targetPath] = c.name;
                _.forEach(c.foreignRelaton.dataMapper, (childCol, childFieldName) => {
                    this.fieldToColumnMapping[childFieldName] = c.foreignRelaton.sourceFieldName + '.' + childCol.name;
                });
            }
        });

        this.insertRecordSqlTemplate = insertRecordSqlTemplate(this.entitySchema);
        this.replaceRecordSqlTemplate = replaceRecordSqlTemplate(this.entitySchema);
        this.deleteRecordTemplate = deleteRecordTemplate(this.entitySchema);
        this.selectSqlTemplate = selectSqlTemplate(this.entitySchema);
        this.countQuery = countQueryTemplate(this.entitySchema);
    }

    public add(entity: any): Promise<number | string> {
        if (this.primaryKeyName) {
            const idValue = entity[this.primaryKeyName];
            if (this.primaryKeyField.sqlType === 'number'
                && _.isString(idValue)
                && _.isEmpty(_.trim(idValue))) {
                entity[this.primaryKeyName] = undefined;
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
            attributeType: 'INTEGER' }];
        return this.filter(filterCriteria).then(function (obj) {
            return obj && obj.length === 1 ? obj[0] : undefined;
        });
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
            blobColumns = this.entitySchema.columns.filter(c => c.sqlType = 'blob'),
            promises = [];
        _.forEach(blobColumns, column => {
            const value = map[column.fieldName];
            if (value) {
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
                if (f.sqlType === 'number' && f.generatorType === 'identity') {
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