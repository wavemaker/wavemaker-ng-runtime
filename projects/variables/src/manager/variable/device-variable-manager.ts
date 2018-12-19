import { BaseVariableManager } from './base-variable.manager';
import { initiateCallback } from '../../util/variable/variables.utils';
import { DeviceVariableService } from './device-variable-service';

/**
 * Device operation registered in this class will be invoked when a device variable requests the operation.
 */
export class DeviceVariableManager extends BaseVariableManager {

    /**
     * A map that contains services and their operations.
     *
     * @type {Map<string, Map<string, DeviceVariableService>>}
     */
    private serviceRegistry: Map<string, DeviceVariableService> = new Map<string, DeviceVariableService>();

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
            return Promise.reject(`Could not find service '${service}'`);
        } else {
            this.notifyInflight(variable, true);
            return service.invoke(variable, options).then( response => {
                this.notifyInflight(variable, false, response);
                return response;
            }, err => {
                this.notifyInflight(variable, false, err);
                return Promise.reject(err);
            });
        }
    }

    /**
     * Adds an operation under the given service category
     * @param {string} service
     */
    public registerService(service: DeviceVariableService) {
        this.serviceRegistry.set(service.name, service);
    }
}
