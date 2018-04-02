import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';

export class ServiceVariable extends ApiAwareVariable {

    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    invoke(options?, success?, error?) {
        return VariableManagerFactory.get(this.category).invoke(this, options, success, error);
    }

    update(options, success, error) {
        return VariableManagerFactory.get(this.category).invoke(this, options, success, error);
    }

    setInput (key, val, options) {
        return VariableManagerFactory.get(this.category).setInput(this, key, val, options);
    }

    clearData () {
        return VariableManagerFactory.get(this.category).clearData(this);
    }

    cancel () {
        return VariableManagerFactory.get(this.category).cancel(this);
    }

    init() {
        VariableManagerFactory.get(this.category).initBinding(this);
        if (this.startUpdate) {
            this.invoke();
        }
    }
}
