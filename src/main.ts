import { enableProdMode } from '@angular/core';
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
        .then(() => console.timeEnd('bootstrap'), err => console.log(err));
});
