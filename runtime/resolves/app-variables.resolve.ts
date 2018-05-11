import { Injectable, Injector } from '@angular/core';
import { HttpService } from '@wm/http';
import { Resolve } from '@angular/router';

import { AppManagerService } from '../services/app.manager.service';

let appVariablesLoaded = false;

@Injectable()
export class AppVariablesResolve implements Resolve<any> {

    constructor(private inj: Injector,
                private $http: HttpService,
                private appManager: AppManagerService) {
    }

    resolve() {
        // execute app.js
        return appVariablesLoaded || this.appManager.loadAppVariables().then(() => {
            appVariablesLoaded = true;
        });
    }
}