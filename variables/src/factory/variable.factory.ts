import { LiveVariable } from '../class/live-variable';
import { NavigationVariable } from '../class/navigation-variable';
import { NotificationVariable } from '../class/notification-variable';
import { ModelVariable } from '../class/model-variable';
import { ServiceVariable } from '../class/service-variable';

export class VariableFactory {

    static create(variable, context) {
        let variableInstance;
        switch (variable.category) {
            case 'wm.Variable':
                variableInstance = new ModelVariable(variable);
                break;
            case 'wm.ServiceVariable':
                variableInstance = new ServiceVariable(variable);
                break;
            case 'wm.LiveVariable':
                variableInstance = new LiveVariable(variable);
                break;
            case 'wm.NavigationVariable':
                variableInstance = new NavigationVariable(variable);
                break;
            case 'wm.NotificationVariable':
                variableInstance = new NotificationVariable(variable);
                break;
        }

        variableInstance._context = context;
        return variableInstance;
    }
}