import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { DeviceVariableManager } from '../../manager/variable/device-variable-manager';
import { ApiAwareVariable } from '@wm/common/variables';

const getManager = () => {
    return <DeviceVariableManager> VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.DEVICE);
};

export class DeviceVariable extends ApiAwareVariable {
    constructor(variable: any) {
        super();
        Object.assign(this as any, variable);
    }

    init() {
        getManager().initBinding(this);
    }

    invoke(options?, onSuccess?, onError?) {
        getManager().invoke(this, options).then(onSuccess, onError);
    }
}
