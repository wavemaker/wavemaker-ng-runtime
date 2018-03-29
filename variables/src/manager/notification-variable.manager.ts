import { ModelVariableManager } from './model-variable.manager';
import * as NOVUtils from '../utils/notification-variable.utils';

export class NotificationVariableManager extends ModelVariableManager{

    notify(variable, options, success, error) {
        NOVUtils.notify(variable, options, success, error);
    }

    getMessage(variable) {
        return NOVUtils.getMessage(variable);
    }

    setMessage(variable, text) {
        return NOVUtils.setMessage(variable, text);
    }

}