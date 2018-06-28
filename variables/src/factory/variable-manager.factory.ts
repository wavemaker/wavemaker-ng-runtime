import { ModelVariableManager } from '../manager/variable/model-variable.manager';
import { ServiceVariableManager } from '../manager/variable/service-variable.manager';
import { LiveVariableManager } from '../manager/variable/live-variable.manager';
import { NavigationActionManager } from '../manager/action/navigation-action.manager';
import { NotificationActionManager } from '../manager/action/notification-action.manager';
import { BaseVariableManager } from '../manager/variable/base-variable.manager';
import { BaseActionManager } from '../manager/action/base-action.manager';
import { LoginActionManager } from '../manager/action/login-action.manager';
import { LogoutActionManager } from '../manager/action/logout-action.manager';
import { TimerActionManager } from '../manager/action/timer-action.manager';
import { DeviceVariableManager } from '../manager/variable/device-variable-manager';
import { WebSocketVariableManager } from '../manager/variable/web-socket-variable.manager';

const managerMap = new Map(),
    typeToManagerMap = {
        'Variable': BaseVariableManager,
        'Action': BaseActionManager,
        'wm.Variable': ModelVariableManager,
        'wm.ServiceVariable': ServiceVariableManager,
        'wm.LiveVariable': LiveVariableManager,
        'wm.NavigationVariable': NavigationActionManager,
        'wm.NotificationVariable': NotificationActionManager,
        'wm.LoginVariable': LoginActionManager,
        'wm.LogoutVariable': LogoutActionManager,
        'wm.TimerVariable': TimerActionManager,
        'wm.DeviceVariable': DeviceVariableManager,
        'wm.WebSocketVariable': WebSocketVariableManager
    };

export class VariableManagerFactory {

    static get(type) {
        return managerMap.has(type) ?
            managerMap.get(type) :
            managerMap.set(type, new typeToManagerMap[type]()).get(type);
    }
}