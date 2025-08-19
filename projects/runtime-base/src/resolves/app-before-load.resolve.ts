import { Injectable } from '@angular/core';

import { AppManagerService } from '../services/app.manager.service';
import { App } from '@wm/core';

@Injectable()
export class AppBeforeLoadResolve {

    constructor(
        private appManager: AppManagerService,
        private app: App
    ) { }

    resolve() {
        this.appManager.initAppModes();
        return this.appManager.beforeAppReady();
    }
}