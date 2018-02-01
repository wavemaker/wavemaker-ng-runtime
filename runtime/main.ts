import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}


console.time('bootstrap');

document.addEventListener('DOMContentLoaded', () => {
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .then(() => {
            console.timeEnd('bootstrap');
        })
        .catch(err => console.log(err));
});
