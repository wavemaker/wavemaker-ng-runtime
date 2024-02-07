import { Injectable } from '@angular/core';


import { AppManagerService } from '../services/app.manager.service';
import { AppVariablesProvider } from '../types/types';

let appVariablesLoaded = false;

@Injectable({
    providedIn: 'root'
})
export class AppVariablesResolve  {

    constructor(
        private appManager: AppManagerService,
        private appVariablesProvider: AppVariablesProvider
    ) {}

    resolve() {
        // execute app.js
        if (appVariablesLoaded) {
            return true;
        }

        return Promise.all([this.appManager.loadSecurityConfig(), this.appManager.loadMetadata(), this.appVariablesProvider.getAppVariables()])
            .then((data) => this.appManager.loadAppVariables(data[2]))
            .then(() => appVariablesLoaded = true);
    }
}
