import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';

import { SecurityService } from '@wm/security';

import { AppManagerService } from '../services/app.manager.service';

let securityConfigLoaded = false;

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private securityService: SecurityService, private appManager: AppManagerService) {}

    loadSecurityConfig(): Promise<boolean> {
        if (securityConfigLoaded) {
            return Promise.resolve(true);
        }

        return this.appManager.loadSecurityConfig().then(() => securityConfigLoaded = true);
    }

    isAuthenticated(): Promise<any> {
        return this.loadSecurityConfig()
            .then(() => {
                return new Promise((resolve, reject) => {
                    this.securityService.isAuthenticated(resolve, reject);
                });
            });
    }

    canActivate(route: ActivatedRouteSnapshot): Promise<any> {
        return this.isAuthenticated()
            .then(isLoggedIn => {
                if (isLoggedIn) {
                    return Promise.resolve(true);
                }

                this.appManager.handle401(route.routeConfig.path);

                return Promise.resolve(false);
            });
    }
}
