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
        if (this.appManager.beforeAppReady) {
            this.appManager.initAppModes();
            this.app.setAppMode = this.appManager.setAppMode;
            return this.appManager.beforeAppReady();
        }
    }
}