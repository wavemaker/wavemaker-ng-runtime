import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve } from '@angular/router';
import * as Utils from '@wm/core';
import { App } from '../services/app.service';

let appJsLoaded = false;

@Injectable()
export class AppJSResolve implements Resolve<any> {

    constructor(private inj: Injector, private $http: HttpClient, private app: App) {}

    resolve() {
        // execute app.js
        return appJsLoaded || this.$http.get('./app.js', {responseType: 'text'})
            .subscribe(response => {
                // @ts-ignore
                const appJs = new Function('App', 'Utils', 'Injector', response);
                appJs(this.app, Utils, this.inj);
                appJsLoaded = true;
            });
    }
}