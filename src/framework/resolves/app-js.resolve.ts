import { Injectable, Injector } from '@angular/core';
import { Resolve } from '@angular/router';

import { initScript } from '../../app/app.component.script';
import { App, UtilsService } from '@wm/core';

let appJsLoaded = false;

@Injectable()
export class AppJSResolve implements Resolve<any> {

    constructor(private inj: Injector, private app: App, private utilService: UtilsService) {}

    resolve() {
        if (appJsLoaded) {
            return true;
        }

        try {
            // execute app.js
            initScript(this.app, this.utilService, this.inj);
        } catch (e) {
            console.warn('Error in executing app.js');
        }

        appJsLoaded = true;

        return true;
    }
}
