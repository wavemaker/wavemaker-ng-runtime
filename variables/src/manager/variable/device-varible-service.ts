import { initiateCallback } from '../../util/variable/variables.utils';
import { IDeviceVariableOperation } from './device-variable-operation';

export class DeviceVaribleService {

    name: string;

    protected operations: IDeviceVariableOperation[];

    invoke(variable: any, options: any) {
        const operation = this.operations.find(o => {
            return o.name = variable.operation;
        });
        if (operation == null) {
            initiateCallback('onError', variable, null);
            return Promise.reject('Could not find operation');
        } else {
            return operation.invoke(variable, options)
                .then(function (data) {
                    variable.dataSet = data;
                    initiateCallback('onSuccess', variable, data);
                }, function (reason) {
                    initiateCallback('onError', variable, null);
                    return Promise.reject(reason);
                });
        }
    }
}
