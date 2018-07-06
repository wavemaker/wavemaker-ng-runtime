import { appManager, processBinding } from '../../util/variable/variables.utils';

export abstract class BaseActionManager {
    initBinding(variable, bindSource?, bindTarget?) {
        processBinding(variable, variable._context, bindSource, bindTarget);
    }

    notifyInflight(variable, status: boolean, data?: any) {
        appManager.notify('toggle-variable-state', {
            variable: variable,
            active: status,
            data: data
        });
    }
}