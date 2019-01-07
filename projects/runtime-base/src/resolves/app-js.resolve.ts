import { Injectable, Injector } from '@angular/core';
import { Resolve } from '@angular/router';

import { App, UtilsService } from '@wm/core';

import { AppJSProvider } from '../types/types';

let appJsLoaded = false;

@Injectable()
export class AppJSResolve implements Resolve<any> {

    constructor(
        private inj: Injector,
        private app: App,
        private utilService: UtilsService,
        private appJsProvider: AppJSProvider
    ) {}

    async resolve() {
        if (appJsLoaded) {
            return true;
        }

        try {
            // execute app.js
            const appScriptFn = await this.appJsProvider.getAppScriptFn();
            appScriptFn(this.app, this.utilService, this.inj);
        } catch (e) {
            console.warn('Error in executing app.js');
        }

        appJsLoaded = true;

        return true;
    }
}
