import { ApplicationRef, enableProdMode, NgModuleRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import initWmProjectProperties from './app/wm-project-properties';
import { isIos, isSpotcues } from '@wm/core';
import { initSpotCues } from '@wm/runtime/base';

initWmProjectProperties();

if (environment.production) {
    enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
    new Promise( resolve => {
        if (isSpotcues) {
            initSpotCues().then(resolve);
        } else if (window['cordova']) {
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
