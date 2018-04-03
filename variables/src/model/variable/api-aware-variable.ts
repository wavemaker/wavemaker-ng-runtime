import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { BaseVariable } from '../base-variable';

const  getManager = (category: string) => {
    return VariableManagerFactory.get(category);
};

export abstract class ApiAwareVariable extends BaseVariable {

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

    invoke(options?, success?, error?) {
        return getManager(this.category).invoke(this, options, success, error);
    }

    init() {
        getManager(this.category).initBinding(this);
        if (this.startUpdate) {
            this.invoke();
        }
    }
}