import { ModelVariable } from './model-variable';
import { VariableManagerFactory } from '../factory/variable-manager.factory';

let manager;
export class NotificationVariable extends ModelVariable {

    message: string;

    constructor(variable: any) {
        super(variable);
        Object.assign(this, variable);
        if (!manager && this.constructor === NotificationVariable) {
            manager = VariableManagerFactory.get(this.category);
        }
    }

    isAction() {
        return true;
    }

    notify(options, success, error) {
        manager.notify(this, options, success, error);
    }

    invoke(options, success, error) {
        this.notify(options, success, error);
    }

    getMessage() {
        return manager.getMessage(this);
    }

    setMessage(text) {
        return manager.setMessage(this, text);
    }

    init() {
        // static property bindings
        manager.initBinding(this, 'dataBinding', 'dataBinding');

        // dynamic property bindings
        manager.initBinding(this, 'dataSet', 'dataSet');
    }
}
