import { Injectable, Injector } from '@angular/core';
import { Resolve } from '@angular/router';

import { App, UtilsService, CustomPipeManager } from '@wm/core';

import { AppExtensionProvider } from '../types/types';

let appJsLoaded = false;

@Injectable()
export class AppExtensionJSResolve implements Resolve<any> {

    constructor(
        private inj: Injector,
        private app: App,
        private utilService: UtilsService,
        private appJsProvider: AppExtensionProvider,
        private customPipeManager: CustomPipeManager
    ) {}

    async resolve() {
        if (appJsLoaded) {
            return true;
        }

        try {
            // execute pipe.config.js
            const appScriptFn = await this.appJsProvider.getAppMetaConfigScripts();
           let frmatterObj = appScriptFn();
            // If user defined the invalid pipes format.
            if(!frmatterObj){
                console.warn('Please return valid formatter');
                return true;
            }

            for(let key in frmatterObj){
                this.customPipeManager.setCustomPipe(key, frmatterObj[key]);
            }
        } catch (e) {
            console.warn('Error in executing pipes.config.js', e);
        }

        appJsLoaded = true;

        return true;
    }
}
