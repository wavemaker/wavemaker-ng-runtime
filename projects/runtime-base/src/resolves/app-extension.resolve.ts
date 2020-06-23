import { Injectable, Injector } from '@angular/core';
import { Resolve } from '@angular/router';

import { App, UtilsService, CustomPipeManager } from '@wm/core';

import { AppExtensionProvider } from '../types/types';
import { AppManagerService } from '../services/app.manager.service';


let appJsLoaded = false;


@Injectable()
export class AppExtensionJSResolve implements Resolve<any> {

    constructor(
        private appManager: AppManagerService,
        private appJsProvider: AppExtensionProvider,
        private customPipeManager: CustomPipeManager
    ) {}

     resolve() {
         if(this.appManager.isPrefabType() || this.appManager.isTemplateBundleType()){
            return true;
         }
        if (!appJsLoaded) {
            this.appJsProvider.loadFormatterConfigScript(this.loadedFormatterScript.bind(this));
            appJsLoaded = true;
        }
        return appJsLoaded;
    }

    // Formatters load callback
    loadedFormatterScript(response){
        try {
           let formatterObj = response;
            // If user defined the invalid formatters.
            if(!formatterObj){
                console.warn('Please return valid formatter object');
            }

            for(let key in formatterObj){
                this.customPipeManager.setCustomPipe(key, formatterObj[key]);
            }
        } catch (e) {
            console.warn('Error in reading formatters.js', e);
        }
    }
}
