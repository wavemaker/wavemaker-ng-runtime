import * as SVUtils from '../../util/variable/service-variable.utils';
import { BaseVariableManager } from './base-variable.manager';

export class ServiceVariableManager extends BaseVariableManager {

    invoke(variable, options, success, error) {
        return SVUtils.invoke(variable, options, success, error);
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