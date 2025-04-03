import { ApplicationRef, enableProdMode, NgModuleRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import {isEmpty} from "lodash-es";

const DEBUG_MODE = 'debugMode';

if (sessionStorage.getItem(DEBUG_MODE) !== 'true') {
    enableProdMode();
}

console.time('bootstrap');


document.addEventListener('DOMContentLoaded', () => {
    new Promise<void|Event>( resolve => {
            resolve();
    }).then(() => platformBrowserDynamic().bootstrapModule(AppModule))
        .then((appModuleRef: NgModuleRef<AppModule>) => {
            const applicationRef = appModuleRef.injector.get(ApplicationRef);
            window.addEventListener('unload', () => {
                applicationRef.components.map(c => c && c.destroy());
            });
            console.timeEnd('bootstrap');
        }, err => console.log(err));
});

(window as any).debugMode = function(on) {
    if (isEmpty(on)) {
        on = true;
    }
    const value = on ? 'true' : 'false';
    if (sessionStorage.getItem(DEBUG_MODE) !== value) {
        sessionStorage.setItem(DEBUG_MODE, value);
        window.location.reload();
    }
};

export default () => {};
