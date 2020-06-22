import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { isIos, isSpotcues } from '@wm/core';
import { initSpotCues } from '@wm/runtime/base';

declare const _;
const DEBUG_MODE = 'debugMode';

if (sessionStorage.getItem(DEBUG_MODE) !== 'true') {
    enableProdMode();
}

console.time('bootstrap');


document.addEventListener('DOMContentLoaded', () => {
    new Promise( resolve => {
        if (isSpotcues) {
            initSpotCues().then(resolve);
        } else if (window['cordova']) {
            document.addEventListener('deviceready', resolve);
        } else {
            resolve();
        }
    }).then(() => {
        return new Promise(resolve => {
            if(isIos() && window['cordova'] && !window['__isLocalStorageReady']) {
                document.addEventListener('localStorageReady', resolve);
            } else {
                resolve();
            }
        });
    }).then(() => platformBrowserDynamic().bootstrapModule(AppModule))
        .then(() => console.timeEnd('bootstrap'), err => console.log(err));
});

(window as any).debugMode = function(on) {
    if (_.isEmpty(on)) {
        on = true;
    }
    const value = on ? 'true' : 'false';
    if (sessionStorage.getItem(DEBUG_MODE) !== value) {
        sessionStorage.setItem(DEBUG_MODE, value);
        window.location.reload();
    }
};

export default () => {};
