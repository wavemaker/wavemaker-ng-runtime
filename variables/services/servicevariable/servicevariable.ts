import {StaticVariable} from '../staticvariable/staticvariable';
// import {externalServices} from '../../../services/externalservices';
import {ServiceVariableService} from './servicevariable.service';

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

    constructor(variable: any, private serviceVariableService: ServiceVariableService, private scope: any) {
        super(variable);
        Object.assign(this, variable);
    }

    invoke() {
        return this.serviceVariableService.invoke(this);
    }

    getData() {
        return this.dataSet;
    }

}
