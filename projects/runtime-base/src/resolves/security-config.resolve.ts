import { Injectable } from '@angular/core';


import { getWmProjectProperties, isMobileApp } from '@wm/core';

import { AppManagerService } from '../services/app.manager.service';

@Injectable({
    providedIn: 'root'
})
export class SecurityConfigResolve  {
    loaded: boolean;

    constructor(private appManager: AppManagerService) {

        if (!isMobileApp()) {
            // if the project type is PREFAB, setting this flag will not trigger security/info call
            this.loaded = this.appManager.isPrefabType() || this.appManager.isTemplateBundleType() || !getWmProjectProperties().securityEnabled;
        }
    }

    resolve() {
        return this.loaded || this.appManager.loadSecurityConfig().then(() => {
            this.loaded = true;
        });
    }
}
