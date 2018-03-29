import { processBinding } from '../utils/variables.utils';

export class VariableManager {
    initBinding(variable, bindSource?, bindTarget?) {
        processBinding(variable, variable._context, bindSource, bindTarget);
    }
}