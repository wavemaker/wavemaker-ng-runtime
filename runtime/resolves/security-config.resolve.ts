import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { AppManagerService } from '../services/app.manager.service';

declare const _WM_APP_PROPERTIES;

@Injectable()
export class SecurityConfigResolve implements Resolve<any> {
    loaded: boolean;

    constructor(private appManager: AppManagerService) {

        // if the project type is PREFAB, setting this flag will not trigger security/info call
        this.loaded = _WM_APP_PROPERTIES.type === 'PREFAB';
    }

    resolve() {
        return this.loaded || this.appManager.loadSecurityConfig().then(() => {
            this.loaded = true;
        });
    }
}
