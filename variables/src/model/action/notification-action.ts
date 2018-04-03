import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';

const  getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.NOTIFICATION);
};

export class NotificationAction extends BaseAction {

    message: string;

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

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
