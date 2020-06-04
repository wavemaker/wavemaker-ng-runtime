import { Injectable } from '@angular/core';
import { AppExtensionProvider } from '@wm/runtime/base';
// import { AppResourceManagerService } from './app-resource-manager.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AppExtensionProviderService extends AppExtensionProvider {

    constructor(private $http: HttpClient) {
        super();
    }
    public getAppMetaConfigScripts(): Promise<Function> {
        return this.$http.get('./extensions/formatters.js', {responseType: 'text'})
            .toPromise()
            .then(script => new Function('return ' + script));
    }
}
