import { InjectionToken } from '@angular/core';

export class IDataSource {
    execute: (operation: Operation, options?: any) => boolean | string | Promise<any>;
}

enum Operation {
    LIST_RECORDS = 'listRecords',
    UPDATE_RECORD = 'updateRecord',
    INSERT_RECORD = 'insertRecord',
    DELETE_RECORD = 'deleteRecord',
    INVOKE = 'invoke',
    UPDATE = 'update',
    NOTIFY = 'notify',
    IS_API_AWARE = 'isApiAware',
    SUPPORTS_CRUD = 'supportsCRUD',
    IS_PAGEABLE = 'isPageable',
    GET_OPERATION_TYPE = 'getOperationType',
    GET_RELATED_PRIMARY_KEYS = 'getRelatedTablePrimaryKeys',
    GET_ENTITY_NAME = 'getEntityName',
    SET_INPUT = 'setinput',
    GET_RELATED_TABLE_DATA = 'getRelatedTableData',
    GET_DISTINCT_DATA_BY_FIELDS = 'getDistinctDataByFields',
    GET_MATCH_MODE = 'getMatchMode',
    DOWNLOAD = 'download',
    GET_NAME = 'getName',
    GET_PROPERTIES_MAP = 'getPropertiesMap',
    GET_PRIMARY_KEY = 'getPrimaryKey',
    GET_BLOB_URL = 'getBlobURL'
}

export const DataSource = {
    Operation
};

export const AppLocale = new InjectionToken('Application Locale Key');
