import { StaticVariable } from '../static-variable/static-variable';
import * as SVUtils from './service-variable.utils';

export class ServiceVariable extends StaticVariable {

    name: string;
    dataSet: any;
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

    constructor(variable: any, private scope?: any) {
        super(variable);
        Object.assign(this, variable);
    }

    invoke(options, success, error) {
        return SVUtils.invoke(this, options, success, error);
    }

    getData() {
        return this.dataSet;
    }

}
