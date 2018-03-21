import { StaticVariable } from '../static-variable/static-variable';
import { toasterService } from './../../utils/variables.utils';
import * as NOVUtils from './notification-variable.utils';

export class NotificationVariable extends StaticVariable {

    message: string;

    constructor(variable: any) {
        super(variable);
        Object.assign(this, variable);
    }

    getData() {
        return this.dataSet;
    }

    setData(dataSet: any) {
        this.dataSet = dataSet;
    }

    notify(options, success, error) {
        NOVUtils.notify(this, options, success, error);
    }

    invoke(options, success, error) {
        this.notify(options, success, error);
    }

    getMessage(variable) {
        return variable.dataBinding.text;
    }
}
