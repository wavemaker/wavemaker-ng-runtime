import { ApplicationRef, enableProdMode } from '@angular/core';

import { isEmpty } from "lodash-es";
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from '@wm/runtime/base';
import { appConfig } from './app/app.config';

const DEBUG_MODE = 'debugMode';

if (sessionStorage.getItem(DEBUG_MODE) !== 'true') {
    enableProdMode();
}

console.time('bootstrap');


document.addEventListener('DOMContentLoaded', () => {
    new Promise<Event | void>(resolve => {
        if (window['cordova']) {
            document.addEventListener('deviceready', resolve);
        } else {
            resolve();
        }
    }).then(() => bootstrapApplication(AppComponent, appConfig))
        .then((appRef: ApplicationRef) => {
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
