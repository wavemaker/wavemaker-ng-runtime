import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';

const REQUIRED_PLUGINS = ['OFFLINE_DB', 'NETWORK'];

export class DatasyncService extends DeviceVariableService {
    public readonly name = 'datasync';
    public readonly operations: IDeviceVariableOperation[] = [];

    constructor() {
        super();
        this.operations.push(new PullOperation());
        this.operations.push(new PushOperation());
    }
}

class PullOperation implements IDeviceVariableOperation {
    public readonly name = 'pull';
    public readonly model = {};
    public readonly properties = [];
    public readonly requiredCordovaPlugins = REQUIRED_PLUGINS;

    constructor() {

    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        return Promise.reject('TO DO');
    }
}

class PushOperation implements IDeviceVariableOperation {
    public readonly name = 'push';
    public readonly model = {};
    public readonly properties = [];
    public readonly requiredCordovaPlugins = REQUIRED_PLUGINS;

    constructor() {

    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        return Promise.reject('TO DO');
    }
}