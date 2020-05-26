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
            // execute app.extension.js
            const appScriptFn = await this.appJsProvider.getAppMetaConfigScripts();
           let appExtension = appScriptFn(this.app, this.utilService, this.inj);

            if(!appExtension || !appExtension.Pipes){
                console.log('Please return valid Pipe object');
                return;
            }
            let pipesObj = appExtension.Pipes;
            for(let key in pipesObj){
                this.customPipeManager.setCustomPipe(key, pipesObj[key]);
            }
        } catch (e) {
            console.warn('Error in executing app.extension.js', e);
        }

        appJsLoaded = true;

        return true;
    }
}
