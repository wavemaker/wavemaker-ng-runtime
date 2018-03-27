import { ModelVariable } from '../model-variable/model-variable';
import { toasterService } from './../../utils/variables.utils';
import * as NOVUtils from './notification-variable.utils';

export class NotificationVariable extends ModelVariable {

    message: string;

    constructor(variable: any) {
        super(variable);
        Object.assign(this, variable);
    }

    notify(options, success, error) {
        NOVUtils.notify(this, options, success, error);
    }

    invoke(options, success, error) {
        this.notify(options, success, error);
    }

    getMessage() {
        return NOVUtils.getMessage(this);
    }

    setMessage(text) {
        return NOVUtils.setMessage(this, text);
    }
}
