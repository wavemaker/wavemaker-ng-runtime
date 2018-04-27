import { BaseVariableManager } from './base-variable.manager';
import { initiateCallback } from '../../util/variable/variables.utils';
import { DeviceVaribleService } from './device-varible-service';

/**
 * Device operation registered in this class will be invoked when a device variable requests the operation.
 */
export class DeviceVariableManager extends BaseVariableManager {

    /**
     * A map that contains services and their operations.
     *
     * @type {Map<string, Map<string, IDeviceOperation>>}
     */
    private serviceRegistry: Map<string, DeviceVaribleService> = new Map<string, DeviceVaribleService>();

    /**
     * Invokes the given device variable and returns a promise that is resolved or rejected
     * by the device operation's outcome.
     * @param variable
     * @param options
     * @returns {Promise<any>}
     */
    public invoke(variable: any, options: any): Promise<any> {
        const service = this.serviceRegistry.get(variable.service);
        if (service == null) {
            initiateCallback('onError', variable, null);
            return Promise.reject('Could not find operation');
        } else {
            return service.invoke(variable, options);
        }
    }

    /**
     * Adds an operation under the given service category
     * @param {string} serviceName
     * @param {IDeviceOperation} operation
     */
    public registerService(service: DeviceVaribleService) {
        this.serviceRegistry.set(service.name, service);
    }
}