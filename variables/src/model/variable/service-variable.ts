import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { DataSource, IDataSource, isDefined } from '@wm/core';
import { ServiceVariableManager } from '../../manager/variable/service-variable.manager';

declare const _;

const getManager = (): ServiceVariableManager => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.SERVICE);
};

export class ServiceVariable extends ApiAwareVariable implements IDataSource {

    _progressObservable;
    pagingOptions;

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    execute(operation, options) {
        let returnVal = super.execute(operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }

        switch (operation) {
            case DataSource.Operation.IS_API_AWARE:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_CRUD:
                returnVal = false;
                break;
            case DataSource.Operation.SUPPORTS_DISTINCT_API:
                returnVal = false;
                break;
            case DataSource.Operation.IS_PAGEABLE:
                returnVal = (this.controller === VARIABLE_CONSTANTS.CONTROLLER_TYPE.QUERY || !_.isEmpty(this.pagingOptions));
                break;
            case DataSource.Operation.SUPPORTS_SERVER_FILTER:
                returnVal = false;
                break;
            case DataSource.Operation.SET_INPUT:
                returnVal = this.setInput(options);
                break;
            case DataSource.Operation.LIST_RECORDS:
                returnVal = this.invoke(options);
                break;
            case DataSource.Operation.INVOKE :
                returnVal = this.invoke(options);
                break;
            case DataSource.Operation.UPDATE :
                returnVal = this.update(options);
                break;
            case DataSource.Operation.SEARCH_RECORDS:
                returnVal = this.searchRecords(options);
                break;
            case DataSource.Operation.DOWNLOAD:
                returnVal = this.download(options);
                break;
            case DataSource.Operation.GET_PAGING_OPTIONS:
                returnVal = this.pagingOptions;
                break;
            default :
                returnVal = {};
                break;
        }
        return returnVal;
    }

    invoke(options?, success?, error?) {
        return getManager().invoke(this, options, success, error);
    }

    update(options, success?, error?) {
        return getManager().invoke(this, options, success, error);
    }

    download(options, success?, error?) {
        return getManager().download(this, options, success, error);
    }

    setInput(key, val?, options?) {
        return getManager().setInput(this, key, val, options);
    }

    searchRecords(options, success?, error?) {
        return getManager().searchRecords(this, options, success, error);
    }

    cancel() {
        return getManager().cancel(this);
    }

    init() {
        getManager().initBinding(this);
        getManager().defineFirstLastRecord(this);
        if (this.startUpdate) {
            this.invoke();
        }
    }
}
