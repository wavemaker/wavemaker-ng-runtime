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

    getOkButtonText()
    {
        return getManager().getOkButtonText(this);
    }

    setOkButtonText(text) {
        return getManager().setOkButtonText(this, text);
    }

    getToasterDuration() {
        return getManager().getToasterDuration(this);
    }

    setToasterDuration(duration) {
        return getManager().setToasterDuration(this, duration);
    }

    getToasterClass() {
        return getManager().getToasterClass(this);
    }

    setToasterClass(classText) {
        return getManager().setToasterClass(this, classText);
    }

    getToasterPosition() {
        return getManager().getToasterPosition(this);
    }

    setToasterPosition(position) {
        return getManager().setToasterPosition(this, position);
    }

    getAlertType() {
        return getManager().getAlertType(this);
    }

    setAlertType(type) {
        return getManager().setAlertType(this, type);
    }

    getCancelButtonText() {
        return getManager().getCancelButtonText(this);
    }

    setCancelButtonText(text) {
        return getManager().setCancelButtonText(this, text);
    }

    init() {
        // static property bindings
        getManager().initBinding(this, 'dataBinding', 'dataBinding');

        // dynamic property bindings
        getManager().initBinding(this, 'dataSet', 'dataSet');
    }
}
