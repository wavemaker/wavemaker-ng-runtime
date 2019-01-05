import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { AppManagerService } from '../services/app.manager.service';
import { AppVariablesProvider } from '../types/types';

let appVariablesLoaded = false;

@Injectable({
    providedIn: 'root'
})
export class AppVariablesResolve implements Resolve<any> {

    constructor(
        private appManager: AppManagerService,
        private appVariablesProvider: AppVariablesProvider
    ) {}

    resolve() {
        // execute app.js
        if (appVariablesLoaded) {
            return true;
        }

        return this.appVariablesProvider.getAppVariables()
            .then((variables) => this.appManager.loadAppVariables(variables))
            .then(() => appVariablesLoaded = true);
    }
}
