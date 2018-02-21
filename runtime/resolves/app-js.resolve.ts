import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve } from '@angular/router';
import * as Utils from '@utils/utils';
import { App } from '../services/app.service';

let appJsLoaded = false;

@Injectable()
export class AppJSResolve implements Resolve<any> {

    constructor(private inj: Injector, private $http: HttpClient, private app: App) {}

    resolve() {
        //execute app.js
        return appJsLoaded || this.$http.get('./app.js', {responseType: 'text'})
            .subscribe(response => {
                response = `console.log(App, Utils, Injector); ${response}`;
                //@ts-ignore
                let appJs = new Function('App', 'Utils', 'Injector', response);
                appJs(this.app, Utils, this.inj);
                appJsLoaded = true;
            });
    }
}