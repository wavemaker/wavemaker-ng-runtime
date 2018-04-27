import { NgModule } from '@angular/core';

import { DeviceVariableManager, VARIABLE_CONSTANTS, VariableManagerFactory } from '@wm/variables';

import { DeviceService } from './services/device-service';

@NgModule({
    imports: [],
    declarations: [],
    providers: []
})
export class VariablesModule {

    constructor() {
        const deviceVariableManager = VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.DEVICE) as DeviceVariableManager;
        deviceVariableManager.registerService(new DeviceService());
    }
}
