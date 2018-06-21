import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { DataSource, IDataSource } from '@wm/core';
import { LiveVariableManager } from '../../manager/variable/live-variable.manager';

const getManager = (): LiveVariableManager => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LIVE);
};

export class LiveVariable extends ApiAwareVariable implements IDataSource {

    matchMode;
    liveSource;
    propertiesMap;
    type;
    _options;

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    execute(operation, options) {
        let returnVal;
        switch (operation) {
            case DataSource.Operation.IS_API_AWARE:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_CRUD:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_DISTINCT_API:
                returnVal = true;
                break;
            case DataSource.Operation.IS_PAGEABLE:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_SERVER_FILTER:
                returnVal = true;
                break;
            case DataSource.Operation.GET_OPERATION_TYPE:
                returnVal = this.operation;
                break;
            case DataSource.Operation.GET_RELATED_PRIMARY_KEYS:
                returnVal = this.getRelatedTablePrimaryKeys(options);
                break;
            case DataSource.Operation.GET_ENTITY_NAME:
                returnVal = this.propertiesMap.entityName;
                break;
            case DataSource.Operation.LIST_RECORDS:
                returnVal = this.listRecords(options);
                break;
            case DataSource.Operation.UPDATE_RECORD :
                returnVal = this.updateRecord(options);
                break;
            case DataSource.Operation.INSERT_RECORD :
                returnVal = this.insertRecord(options);
                break;
            case DataSource.Operation.DELETE_RECORD :
                returnVal = this.deleteRecord(options);
                break;
            case DataSource.Operation.INVOKE :
                returnVal = this.invoke(options);
                break;
            case DataSource.Operation.UPDATE :
                returnVal = this.update(options);
                break;
            case DataSource.Operation.GET_RELATED_TABLE_DATA:
                returnVal = this.getRelatedTableData(options.relatedField, options);
                break;
            case DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS:
                returnVal = this.getDistinctDataByFields(options);
                break;
            case DataSource.Operation.GET_AGGREGATED_DATA:
                returnVal = this.getAggregatedData(options);
                break;
            case DataSource.Operation.GET_MATCH_MODE:
                returnVal = this.matchMode;
                break;
            case DataSource.Operation.DOWNLOAD:
                returnVal = this.download(options);
                break;
            case DataSource.Operation.GET_NAME:
                returnVal = this.name;
                break;
            case DataSource.Operation.GET_PROPERTIES_MAP:
                returnVal = this.propertiesMap;
                break;
            case DataSource.Operation.GET_PRIMARY_KEY:
                returnVal = this.getPrimaryKey();
                break;
            case DataSource.Operation.GET_BLOB_URL:
                returnVal = `services/${this.liveSource}/${this.type}/${options.primaryValue}/content/${options.columnName}`;
                break;
            case DataSource.Operation.GET_OPTIONS:
                returnVal = this._options || {};
                break;
            case DataSource.Operation.SEARCH_RECORDS:
                returnVal = this.searchRecords(options);
                break;
            default:
                returnVal = {};
                break;
        }
        return returnVal;
    }

    listRecords(options?, success?, error?) {
        return getManager().listRecords(this, options, success, error);
    }

    updateRecord(options?, success?, error?) {
        return getManager().updateRecord(this, options, success, error);
    }

    insertRecord(options?, success?, error?) {
        return getManager().insertRecord(this, options, success, error);
    }

    deleteRecord(options?, success?, error?) {
        return getManager().deleteRecord(this, options, success, error);
    }

    setInput(key, val, options) {
        return getManager().setInput(this, key, val, options);
    }

    setFilter(key, val) {
        return getManager().setFilter(this, key, val);
    }

    download(options?) {
        return getManager().download(this, options);
    }

    invoke(options?, success?, error?) {
        switch (this.operation) {
            case 'insert':
                return this.insertRecord(options, success, error);
            case 'update':
                return this.updateRecord(options, success, error);
            case 'delete':
                return this.deleteRecord(options, success, error);
            default:
                return this.listRecords(options, success, error);
        }
    }

    getRelatedTablePrimaryKeys(columnName) {
        return getManager().getRelatedTablePrimaryKeys(this, columnName);
    }

    getRelatedTableData(columnName, options, success?, error?) {
        return getManager().getRelatedTableData(this, columnName, options, success, error);
    }

    getDistinctDataByFields(options, success?, error?) {
        return getManager().getDistinctDataByFields(this, options, success, error);
    }

    getAggregatedData(options, success?, error?) {
        return getManager().getAggregatedData(this, options, success, error);
    }

    getPrimaryKey() {
        return getManager().getPrimaryKey(this);
    }

    searchRecords(options, success?, error?) {
        return getManager().searchRecords(this, options, success, error);
    }

    _downgradeInputData(data) {
        return getManager().downgradeFilterExpressionsToInputData(this, data);
    }

    _upgradeInputData(response, data) {
        return getManager().upgradeInputDataToFilterExpressions(this, response, data);
    }

    // legacy method
    update(options?, success?, error?) {
        return this.invoke(options, success, error);
    }

    init() {
        getManager().initBinding(this, 'dataBinding', this.operation === 'read' ? 'filterFields' : 'inputFields');
        if (this.operation === 'read') {
            getManager().initFilterExpressionBinding(this);
        }
        getManager().defineFirstLastRecord(this);
        if (this.startUpdate) {
            setTimeout(()=>{
                this.invoke();
            });
        }
    }
}
