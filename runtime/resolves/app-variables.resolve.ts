import { Injectable, Injector } from '@angular/core';
import { HttpService } from '@wm/http';
import { Resolve } from '@angular/router';
import { App } from '../services/app.service';
import { VariablesService } from '@wm/variables';

let appVariablesLoaded = false;

@Injectable()
export class AppVariablesResolve implements Resolve<any> {

    constructor(private inj: Injector, private $http: HttpService, private app: App, private variablesService: VariablesService) {}

    resolve() {
        // execute app.js
        return appVariablesLoaded || this.$http.get('./app.variables.json')
            .then(response => {
                // @ts-ignore
                console.log('appVariables', response);
                const data = this.variablesService.register('app', response, this.app);
                this.app.Variables = data.Variables;
                this.app.Actions = data.Actions;
                appVariablesLoaded = true;
            });
    }
}