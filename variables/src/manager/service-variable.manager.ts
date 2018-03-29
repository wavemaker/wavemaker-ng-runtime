import { ModelVariableManager } from './model-variable.manager';
import * as SVUtils from '../utils/service-variable.utils';

export class ServiceVariableManager extends ModelVariableManager{

    invoke(variable, options, success, error) {
        SVUtils.invoke(variable, options, success, error);
    }

    setInput(variable, key, val, options) {
        SVUtils.setInput(variable, key, val, options);
    }

    clearData(variable) {
        SVUtils.clearData(variable);
    }

    cancel(variable) {
        SVUtils.cancel(variable);
    }
}