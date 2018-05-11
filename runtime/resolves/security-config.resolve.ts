import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { AppManagerService } from '../services/app.manager.service';

@Injectable()
export class SecurityConfigResolve implements Resolve<any> {
    loaded: boolean;

    constructor(private appManager: AppManagerService) {}

    resolve() {
        return this.loaded || this.appManager.loadSecurityConfig().then(() => {
            this.loaded = true;
        });
    }
}
