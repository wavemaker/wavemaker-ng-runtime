import { ApplicationRef, enableProdMode, NgModuleRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import initWmProjectProperties from './app/wm-project-properties';
import { WMAppProperties } from './app/wmProperties';

(window as any)._WM_APP_PROPERTIES  = WMAppProperties
initWmProjectProperties();

if (environment.production) {
    enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
    new Promise<Event | void>( resolve => {
        if (window['cordova']) {
            document.addEventListener('deviceready', resolve);
        } else {
            resolve();
        }
    }).then(() => platformBrowserDynamic().bootstrapModule(AppModule))
        .then((appModuleRef: NgModuleRef<AppModule>) => {
            const applicationRef = appModuleRef.injector.get(ApplicationRef);
            window.addEventListener('unload', () => {
                applicationRef.components.map(c => c && c.destroy());
            });
            console.timeEnd('bootstrap'), err => console.log(err);
        }, err => console.log(err));
});
