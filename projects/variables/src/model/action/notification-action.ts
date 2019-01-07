import { DataSource, IDataSource, isDefined } from '@wm/core';

import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';

const getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.NOTIFICATION);
};

export class NotificationAction extends BaseAction implements IDataSource {

    message: string;

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    execute(operation, options) {
        const returnVal = super.execute(operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }

        return new Promise((resolve, reject) => {
            switch (operation) {
                case DataSource.Operation.INVOKE :
                    this.invoke(options, resolve, reject);
                    break;
                case DataSource.Operation.NOTIFY :
                    this.notify(options, resolve, reject);
                    break;
                default :
                    reject(`${operation} operation is not supported on this data source`);
                    break;
            }
        });
    }

    // Backward compatible method
    notify(options, success, error) {
        getManager().notify(this, options, success, error);
    }

    invoke(options, success, error) {
        this.notify(options, success, error);
    }

    getMessage() {
        return getManager().getMessage(this);
    }

    setMessage(text) {
        return getManager().setMessage(this, text);
    }

    init() {
        // static property bindings
        getManager().initBinding(this, 'dataBinding', 'dataBinding');

        // dynamic property bindings
        getManager().initBinding(this, 'dataSet', 'dataSet');
    }
}
