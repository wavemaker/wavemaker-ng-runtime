import { processBinding } from '../../util/variable/variables.utils';
import { appManager} from './../../util/variable/variables.utils';

export abstract class BaseVariableManager {

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
