import * as NOVUtils from '../../util/action/notification-variable.utils';
import { BaseActionManager } from './base-action.manager';

export class NotificationActionManager extends BaseActionManager {

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