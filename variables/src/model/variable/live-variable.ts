import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { DataSource, IDataSource } from '../../data-source';

const getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LIVE);
};

export class LiveVariable extends ApiAwareVariable implements IDataSource {

    propertiesMap;

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    execute(operation, options) {
        if (operation === DataSource.Operation.IS_API_AWARE) {
            return true;
        }
        if (operation === DataSource.Operation.SUPPORTS_CRUD) {
            return true;
        }
        if (operation === DataSource.Operation.IS_PAGEABLE) {
            return true;
        }
        if (operation === DataSource.Operation.GET_OPERATION_TYPE) {
            return this.operation;
        }
        if (operation === DataSource.Operation.GET_RELATED_PRIMARY_KEYS) {
            return this.getRelatedTablePrimaryKeys(options);
        }
        if (operation === DataSource.Operation.GET_ENTITY_NAME) {
            return this.propertiesMap.entityName;
        }
        return new Promise((resolve, reject) => {
            switch (operation) {
                case DataSource.Operation.LIST_RECORDS :
                    this.listRecords(options, (data, propertiesMap, pagingOptions) => {
                        resolve({data, propertiesMap, pagingOptions});
                    }, reject);
                    break;
                case DataSource.Operation.UPDATE_RECORD :
                    this.updateRecord(options, resolve, reject);
                    break;
                case DataSource.Operation.INSERT_RECORD :
                    this.insertRecord(options, resolve, reject);
                    break;
                case DataSource.Operation.DELETE_RECORD :
                    this.deleteRecord(options, resolve, reject);
                    break;
                case DataSource.Operation.INVOKE :
                    this.invoke(options, resolve, reject);
                    break;
                case DataSource.Operation.UPDATE :
                    this.update(options, resolve, reject);
                    break;
                case DataSource.Operation.GET_RELATED_TABLE_DATA:
                    this.getRelatedTableData(options.relatedField, options, resolve, reject);
                    break;
                case DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS:
                    this.getDistinctDataByFields(options, resolve, reject);
                    break;
                default :
                    reject(`${operation} operation is not supported on this data source`);
                    break;
            }
        });
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

    getRelatedTableData(columnName, options, success, error) {
        getManager().getRelatedTableData(this, columnName, options, success, error);
    }

    getDistinctDataByFields(options, success, error) {
        getManager().getDistinctDataByFields(this, options, success, error);
    }

    // legacy method
    update(options?, success?, error?) {
        return this.invoke(options, success, error);
    }

    init() {
        getManager().initBinding(this, 'dataBinding', this.operation === 'read' ? 'filterFields' : 'inputFields');
        if (this.startUpdate) {
            this.invoke();
        }
    }
}
