import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseAction } from '../base-action';

export class NotificationAction extends BaseAction {

    message: string;

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    notify(options, success, error) {
        VariableManagerFactory.get(this.category).notify(this, options, success, error);
    }

    invoke(options, success, error) {
        this.notify(options, success, error);
    }

    getMessage() {
        return VariableManagerFactory.get(this.category).getMessage(this);
    }

    setMessage(text) {
        return VariableManagerFactory.get(this.category).setMessage(this, text);
    }

    init() {
        // static property bindings
        VariableManagerFactory.get(this.category).initBinding(this, 'dataBinding', 'dataBinding');

        // dynamic property bindings
        VariableManagerFactory.get(this.category).initBinding(this, 'dataSet', 'dataSet');
    }
}
