import { ApplicationRef, enableProdMode, inject } from '@angular/core';

import { isEmpty } from "lodash-es";
import { bootstrapApplication } from '@angular/platform-browser';
import {setPreviewProperties} from '@wm/core';
import { AppComponent } from '@wm/runtime/base';
import { appConfig } from './app/app.config';
import {CustomIconsLoaderService} from '@wm/core';
import { AppJSResolve } from '@wm/runtime/base';
import { AbstractI18nService } from '@wm/core';

const DEBUG_MODE = 'debugMode';

// Initialize project details function
const initializeProjectDetails = async () => {
    let cdnUrl = document.querySelector('[name="deployUrl"]') && document.querySelector('[name="deployUrl"]').getAttribute('content');
    const { _WM_APP_PROJECT } = await import('@wm/core');
    _WM_APP_PROJECT.isPreview = cdnUrl ? false : true;
    const apiUrl = document.querySelector('[name="apiUrl"]') && document.querySelector('[name="apiUrl"]').getAttribute('content');
    //for preview
    if (!cdnUrl) {
        cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
    }
    _WM_APP_PROJECT.id = location.href.split('/')[3];
    // Integration with third party apps like in SSPA/WebComponents, this meta tag with cdnUrl will not be there then default it to ng-bundle/
    _WM_APP_PROJECT.apiUrl = apiUrl || './';
    _WM_APP_PROJECT.cdnUrl = cdnUrl || 'ng-bundle/';
    _WM_APP_PROJECT.ngDest = 'ng-bundle/';
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        __webpack_require__.p = __webpack_public_path__ = cdnUrl;
    } catch (e) {
        //for app preview there is no webpack. Don't do anything.
    }
};

// Application initialization function
const initializeApp = async () => {
    await initializeProjectDetails();
    // Get services from the application
    const appRef = inject(ApplicationRef);
    const i18nService = appRef.injector.get(AbstractI18nService);
    const appJSResolve = appRef.injector.get(AppJSResolve);
    
    await appJSResolve.resolve();
    // Call the appropriate method for loading locale
    if (i18nService && typeof i18nService.loadDefaultLocale === 'function') {
        return i18nService.loadDefaultLocale();
    }
    return Promise.resolve();
};

if (sessionStorage.getItem(DEBUG_MODE) !== 'true') {
    enableProdMode();
}
fetch('./font.config.js')
    .then(response => response.text())
    .then((fontConfig) => {
        setPreviewProperties({ fontConfig });
        const iconLoader = new CustomIconsLoaderService();
        iconLoader.load();
    })
console.time('bootstrap');


document.addEventListener('DOMContentLoaded', () => {
  new Promise<Event | void>(resolve => {
      resolve();
  }).then(() => bootstrapApplication(AppComponent, appConfig))
    .then(async (appRef: ApplicationRef) => { 
      // Initialize the application after bootstrap
      try {
        await initializeApp();
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
      
      window.addEventListener('unload', () => {
        appRef.components.map(c => c?.destroy());
      });
    })
    .catch(err => console.error('Error bootstrapping app:', err));
});

(window as any).debugMode = function (on) {
    if (isEmpty(on)) {
        on = true;
    }
    const value = on ? 'true' : 'false';
    if (sessionStorage.getItem(DEBUG_MODE) !== value) {
        sessionStorage.setItem(DEBUG_MODE, value);
        window.location.reload();
    }
};

export default () => { };
