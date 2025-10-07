import { Injectable } from '@angular/core';
import { AppVariablesProvider } from '@wm/runtime/base';
import { AppResourceManagerService } from './app-resource-manager.service';
import { App } from '@wm/core';

@Injectable({
    providedIn: 'root'
})
export class AppVariablesProviderService extends AppVariablesProvider {
    constructor(private resourceManager: AppResourceManagerService, private app: App) {
        super();
    }

    public async getAppVariables(): Promise<any> {
        // if prefab return {} - app variables will be empty for prefabs
        return this.app.isPrefabType ? {} : this.resourceManager.get('./app.variables.json');
    }
}
