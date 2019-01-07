import { Injectable } from '@angular/core';
import { AppVariablesProvider } from '@wm/runtime/base';
import { AppResourceManagerService } from './app-resource-manager.service';

@Injectable({
    providedIn: 'root'
})
export class AppVariablesProviderService extends AppVariablesProvider {
    constructor(private resourceManager: AppResourceManagerService) {
        super();
    }

    public async getAppVariables(): Promise<any> {
        return this.resourceManager.get('./app.variables.json');
    }
}
