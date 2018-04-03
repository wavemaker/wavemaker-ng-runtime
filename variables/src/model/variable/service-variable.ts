import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';

const  getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.SERVICE);
};

export class ServiceVariable extends ApiAwareVariable {

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    invoke(options?, success?, error?) {
        return getManager().invoke(this, options, success, error);
    }

    update(options, success, error) {
        return getManager().invoke(this, options, success, error);
    }

    setInput (key, val, options) {
        return getManager().setInput(this, key, val, options);
    }

    clearData () {
        return getManager().clearData(this);
    }

    cancel () {
        return getManager().cancel(this);
    }

    init() {
        getManager().initBinding(this);
        if (this.startUpdate) {
            this.invoke();
        }
    }
}
