import { processBinding } from '../../util/variable/variables.utils';

export abstract class BaseActionManager {
    initBinding(variable, bindSource?, bindTarget?) {
        processBinding(variable, variable._context, bindSource, bindTarget);
    }
}