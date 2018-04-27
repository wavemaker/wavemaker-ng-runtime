import {  DeviceVaribleService, IDeviceVariableOperation } from '@wm/variables';

/**
 * this file contains all device operations under 'device' service.
 */
export class DeviceService extends DeviceVaribleService {
    name = 'device';
    operations = [
        new DeviceInfoOperation()
    ];
}

/**
 * This class handles 'getDeviceInfo' device operation.
 */
class DeviceInfoOperation implements IDeviceVariableOperation {
    name = 'getDeviceInfo';
    model = {
        'deviceModel': 'DEVICEMODEL',
        'os': 'DEVICEOS',
        'osVersion': 'X.X.X',
        'deviceUUID': 'DEVICEUUID'
    };
    properties = [
        {'target': 'startUpdate', 'type': 'boolean', 'value': true, 'hide': true}
    ];

    public invoke(variable: any, options: any): Promise<any> {
        return Promise.resolve(this.model);
    }
}

