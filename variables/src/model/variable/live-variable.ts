import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { DataSource, IDataSource } from '../../data-source';

const getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LIVE);
};

export class LiveVariable extends ApiAwareVariable implements IDataSource {

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    execute(operation, options) {
        return new Promise((resolve, reject) => {
            switch (operation) {
                case DataSource.OPERATION.LIST_RECORD :
                    this.listRecords(options, (response, propsMap, pagingOptions) => {
                        resolve({response, propsMap, pagingOptions});
                    }, reject);
                    break;
                case DataSource.OPERATION.UPDATE_RECORD :
                    this.updateRecord(options, resolve, reject);
                    break;
                case DataSource.OPERATION.INSERT_RECORD :
                    this.insertRecord(options, resolve, reject);
                    break;
                case DataSource.OPERATION.DELETE_RECORD :
                    this.deleteRecord(options, resolve, reject);
                    break;
                case DataSource.OPERATION.INVOKE :
                    this.invoke(options, resolve, reject);
                    break;
                case DataSource.OPERATION.UPDATE :
                    this.update(options, resolve, reject);
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
