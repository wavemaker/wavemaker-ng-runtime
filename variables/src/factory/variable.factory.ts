import { LiveVariable } from '../model/variable/live-variable';
import { NavigationAction } from '../model/action/navigation-action';
import { ModelVariable } from '../model/variable/model-variable';
import { ServiceVariable } from '../model/variable/service-variable';
import { NotificationAction } from '../model/action/notification-action';
import {VARIABLE_CONSTANTS} from '../constants/variables.constants';

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
            case VARIABLE_CONSTANTS.CATEGORY.NAVIGATION:
                variableInstance = new NavigationAction(variable);
                break;
            case VARIABLE_CONSTANTS.CATEGORY.NOTIFICATION:
                variableInstance = new NotificationAction(variable);
                break;
        }

        variableInstance._context = context;
        return variableInstance;
    }
}