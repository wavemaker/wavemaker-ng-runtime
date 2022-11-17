import { DeviceVariable } from '../model/variable/device-variable';
import { NavigationAction } from '../model/action/navigation-action';
import { NotificationAction } from '../model/action/notification-action';
import { ModelVariable, ServiceVariable, LiveVariable, CrudVariable, TimerAction, VARIABLE_CONSTANTS } from '@wm/common/variables';
import { LoginAction } from '../model/action/login-action';
import { LogoutAction } from '../model/action/logout-action';
import { WebSocketVariable } from '../model/variable/web-socket-variable';

export class VariableFactory {

    static create(variable, context) {
        let variableInstance;
        switch (variable.category) {
            case VARIABLE_CONSTANTS.CATEGORY.MODEL:
                variableInstance = new ModelVariable(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.SERVICE:
                variableInstance = new ServiceVariable(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.LIVE:
                variableInstance = new LiveVariable(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.CRUD:
                variableInstance = new CrudVariable(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.DEVICE:
                variableInstance = new DeviceVariable(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.NAVIGATION:
                variableInstance = new NavigationAction(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.NOTIFICATION:
                variableInstance = new NotificationAction(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.LOGIN:
                variableInstance = new LoginAction(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.LOGOUT:
                variableInstance = new LogoutAction(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.TIMER:
                variableInstance = new TimerAction(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.WEBSOCKET:
                variableInstance = new WebSocketVariable(variable);
        }

        variableInstance._context = context;
        variableInstance.__cloneable__ = false;
        return variableInstance;
    }
}
