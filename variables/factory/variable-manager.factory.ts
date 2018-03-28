import { ModelVariableManager } from './../manager/model-variable.manager';
import { ServiceVariableManager } from './../manager/service-variable.manager';
import { LiveVariableManager } from './../manager/live-variable.manager';
import { NavigationVariableManager } from './../manager/navigation-variable.manager';
import { NotificationVariableManager } from './../manager/notification-variable.manager';

const managerMap = new Map(),
    typeToManagerMap = {
        'wm.Variable': ModelVariableManager,
        'wm.ServiceVariable': ServiceVariableManager,
        'wm.LiveVariable': LiveVariableManager,
        'wm.NavigationVariable': NavigationVariableManager,
        'wm.NotificationVariable': NotificationVariableManager
    };

export class VariableManagerFactory {

    static get(type) {
        return managerMap.has(type) ?
            managerMap.get(type) :
            managerMap.set(type, new typeToManagerMap[type]()).get(type);
    }
}