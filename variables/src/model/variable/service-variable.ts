import { isPageable } from '@wm/utils';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { DataSource_Operation, IDataSource } from '../../data-source';

const getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.SERVICE);
};

export class ServiceVariable extends ApiAwareVariable implements IDataSource {

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    execute(operation, options) {
        if (operation === DataSource_Operation.IS_API_AWARE) {
            return true;
        }
        if (operation === DataSource_Operation.SUPPORTS_CRUD) {
            return false;
        }
        if (operation === DataSource_Operation.IS_PAGEABLE) {
            return this.controller === VARIABLE_CONSTANTS.CONTROLLER_TYPE.QUERY || isPageable(this.dataSet);
        }
        if (operation === DataSource_Operation.SET_INPUT) {
            return this.setInput(options);
        }
        return new Promise((resolve, reject) => {
            switch (operation) {
                case DataSource_Operation.LIST_RECORDS:
                    this.invoke(options, resolve, reject);
                    break;
                case DataSource_Operation.INVOKE :
                    this.invoke(options, resolve, reject);
                    break;
                case DataSource_Operation.UPDATE :
                    this.update(options, resolve, reject);
                    break;
                default :
                    reject(`${operation} operation is not supported on this data source`);
                    break;
            }
        });
    }

    invoke(options?, success?, error?) {
        return getManager().invoke(this, options, success, error);
    }

    update(options, success, error) {
        return getManager().invoke(this, options, success, error);
    }

    setInput(key, val?, options?) {
        return getManager().setInput(this, key, val, options);
    }

    clearData() {
        return getManager().clearData(this);
    }

    cancel() {
        return getManager().cancel(this);
    }

    init() {
        getManager().initBinding(this);
        if (this.startUpdate) {
            this.invoke();
        }
    }
}
