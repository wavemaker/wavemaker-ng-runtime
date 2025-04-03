import { NavigationActionManager } from '../manager/action/navigation-action.manager';
import { NotificationActionManager } from '../manager/action/notification-action.manager';
import { BaseVariableManager } from '../manager/variable/base-variable.manager';
import { BaseActionManager } from '../manager/action/base-action.manager';
import { LoginActionManager } from '../manager/action/login-action.manager';
import { LogoutActionManager } from '../manager/action/logout-action.manager';
import { WebSocketVariableManager } from '../manager/variable/web-socket-variable.manager';

const managerMap = new Map(),
    typeToManagerMap = {
        'Variable': BaseVariableManager,
        'Action': BaseActionManager,
        'wm.NavigationVariable': NavigationActionManager,
        'wm.NotificationVariable': NotificationActionManager,
        'wm.LoginVariable': LoginActionManager,
        'wm.LogoutVariable': LogoutActionManager,
        'wm.WebSocketVariable': WebSocketVariableManager
    };

export class VariableManagerFactory {

    static get(type) {
        return managerMap.has(type) ?
            managerMap.get(type) :
            managerMap.set(type, new typeToManagerMap[type]()).get(type);
    }
}
