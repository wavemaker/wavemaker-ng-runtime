import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

const pageNameVsAuthorizedMap = new Map<string, boolean>();

@Injectable()
export class AuthorizationResolve implements Resolve<any> {

    constructor(private $http: HttpClient) {}

    resolve(route: ActivatedRouteSnapshot) {

        const pageName = route.routeConfig.path;

        if (pageNameVsAuthorizedMap.has(pageName)) {
            return pageNameVsAuthorizedMap.get(pageName);
        }

        return this.$http.get(`./pages/${pageName}/${pageName}.css`, {responseType: 'text'})
            .subscribe(() => {
                pageNameVsAuthorizedMap.set(pageName, true);
            }, error => {
                pageNameVsAuthorizedMap.set(pageName, false);
                console.log(error);
            });
    }
}
