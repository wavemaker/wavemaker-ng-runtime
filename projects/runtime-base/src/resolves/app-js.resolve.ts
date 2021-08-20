import { Injectable, Injector } from '@angular/core';
import { Resolve } from '@angular/router';

import { App, UtilsService } from '@wm/core';

import { AppJSProvider } from '../types/types';
import { AppManagerService } from '../services/app.manager.service';

let appJsLoaded = false;

@Injectable()
export class AppJSResolve implements Resolve<any> {
    private appManager;

    // AppManagerService: To be make sure this instance available for locale(en.json) calls request to track inside intercepter
    constructor(
        private inj: Injector,
        private app: App,
        private utilService: UtilsService,
        private appJsProvider: AppJSProvider
    ) {
        this.appManager = this.inj.get(AppManagerService);
    }

    async resolve() {
        if (appJsLoaded) {
            return true;
        }

        try {
            // execute app.js
            const appScriptFn = await this.appJsProvider.getAppScriptFn();
            appScriptFn(this.app, this.utilService, this.inj);
        } catch (e) {
            console.warn('Error in executing app.js', e);
        }

        appJsLoaded = true;

        return true;
    }
}
