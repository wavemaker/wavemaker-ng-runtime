import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { DataSource, IDataSource } from '../../data-source';

const getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.SERVICE);
};

export class ServiceVariable extends ApiAwareVariable implements IDataSource {

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    execute(operation, options) {
        return new Promise((resolve, reject) => {
            switch (operation) {
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

    invoke(options?, success?, error?) {
        return getManager().invoke(this, options, success, error);
    }

    update(options, success, error) {
        return getManager().invoke(this, options, success, error);
    }

    setInput(key, val, options) {
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
