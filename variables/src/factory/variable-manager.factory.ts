import { ModelVariableManager } from '../manager/variable/model-variable.manager';
import { ServiceVariableManager } from '../manager/variable/service-variable.manager';
import { LiveVariableManager } from '../manager/variable/live-variable.manager';
import { NavigationActionManager } from '../manager/action/navigation-action.manager';
import { NotificationActionManager } from '../manager/action/notification-action.manager';
import { BaseVariableManager } from '../manager/variable/base-variable.manager';
import { BaseActionManager } from '../manager/action/base-action.manager';

const managerMap = new Map(),
    typeToManagerMap = {
        'Variable': BaseVariableManager,
        'Action': BaseActionManager,
        'wm.Variable': ModelVariableManager,
        'wm.ServiceVariable': ServiceVariableManager,
        'wm.LiveVariable': LiveVariableManager,
        'wm.NavigationVariable': NavigationActionManager,
        'wm.NotificationVariable': NotificationActionManager
    };

export class VariableManagerFactory {

    static get(type) {
        return managerMap.has(type) ?
            managerMap.get(type) :
            managerMap.set(type, new typeToManagerMap[type]()).get(type);
    }
}