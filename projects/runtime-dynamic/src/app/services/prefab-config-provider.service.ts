import { Injectable } from '@angular/core';

import { getPrefabConfigUrl, PrefabConfigProvider } from '@wm/runtime/base';

import { AppResourceManagerService } from './app-resource-manager.service';

const cache = new Map<string, any>();
@Injectable()
export class PrefabConfigProviderService extends PrefabConfigProvider {

    constructor(private resourceMngr: AppResourceManagerService) {
        super();
    }

    public getConfig(prefabName: string): Promise<any> {
        const config = cache.get(prefabName);
        if (config) {
            return Promise.resolve(config);
        }

        return this.resourceMngr.get(getPrefabConfigUrl(prefabName))
            .then(_config => {
                cache.set(prefabName, _config);
                return _config;
            });
    }
}
