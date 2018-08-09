import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

const DEBUG_MODE = 'debugMode';

if (sessionStorage.getItem(DEBUG_MODE) !== 'true') {
    enableProdMode();
}

console.time('bootstrap');

document.addEventListener('DOMContentLoaded', () => {
    new Promise( resolve => {
        if (window['cordova']) {
            document.addEventListener('deviceready', resolve);
        } else {
            resolve();
        }
    }).then(() => platformBrowserDynamic().bootstrapModule(AppModule))
    .then(() => console.timeEnd('bootstrap'), err => console.log(err));
});

// exports
export * from './services/i18n.service';

export * from './services/angular1.polyfills';

(window as any).debugMode = () => {
    sessionStorage.setItem('debugMode', 'true');
    window.location.reload();
};