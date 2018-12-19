import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AppManagerService } from '../services/app.manager.service';
import { variables } from '../../app/app.component.variables';

let appVariablesLoaded = false;

@Injectable()
export class AppVariablesResolve implements Resolve<any> {

    constructor(private appManager: AppManagerService) {}

    resolve() {
        // execute app.js
        return appVariablesLoaded || this.appManager.loadAppVariables(variables)
            .then(() => appVariablesLoaded = true);
    }
}
