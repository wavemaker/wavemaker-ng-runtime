import { ModelVariable } from './model-variable';
import { VariableManagerFactory } from '../factory/variable-manager.factory';

let manager;
export class ServiceVariable extends ModelVariable {

    service: string;
    operation: string;
    controller: string;
    operationId: string;
    operationType: string;
    serviceType: string;
    maxResults: number;
    startUpdate: boolean;
    autoUpdate: boolean;
    inFlightBehavior: boolean;
    transformationRequired: boolean;

    onBeforeUpdate: string;
    onResult: string;
    onError: string;
    onBeforeDatasetReady: string;
    onSuccess: string;

    constructor(variable: any) {
        super(variable);
        Object.assign(this, variable);

        if (!manager && this.constructor === ServiceVariable) {
            manager = VariableManagerFactory.get(variable.category);
        }
    }

    invoke(options?, success?, error?) {
        return manager.invoke(this, options, success, error);
    }

    update(options, success, error) {
        return manager.invoke(this, options, success, error);
    }

    setInput (key, val, options) {
        return manager.setInput(this, key, val, options);
    }

    clearData () {
        return manager.clearData(this);
    }

    cancel () {
        return manager.cancel(this);
    }

    init() {
        manager.initBinding(this);
        if (this.startUpdate) {
            this.invoke();
        }
    }
}
