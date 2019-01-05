import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppJSProvider } from '@wm/runtime/base';

@Injectable({
    providedIn: 'root'
})
export class AppJSProviderService extends AppJSProvider {
    constructor(private $http: HttpClient) {
        super();
    }

    public getAppScriptFn(): Promise<Function> {
        return this.$http.get('./app.js', {responseType: 'text'})
            .toPromise()
            .then(script => new Function('App', 'Utils', 'Injector', script));
    }
}
