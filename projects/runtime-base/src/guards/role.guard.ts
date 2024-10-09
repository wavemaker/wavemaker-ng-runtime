import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { AbstractToasterService, App } from '@wm/core';
import { SecurityService } from '@wm/security';

import { AuthGuard } from './auth.guard';
import { AppManagerService } from '../services/app.manager.service';
import {intersection} from "lodash-es";

@Injectable()
export class RoleGuard {

    constructor(
        private securityService: SecurityService,
        private authGuard: AuthGuard,
        private toasterService: AbstractToasterService,
        private app: App,
        private appManager: AppManagerService
    ) {}

    canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        const allowedRoles = route.data.allowedRoles;

        return this.authGuard.isAuthenticated()
            .then((isLoggedIn: boolean) => {
                if (isLoggedIn) {
                    const userRoles = this.securityService.get().userInfo.userRoles;
                    const hasAccess = intersection(allowedRoles, userRoles).length > 0;

                    if (hasAccess) {
                        return Promise.resolve(true);
                    }

                    // current loggedin user doesn't have access to the page that the user is trying to view
                    this.appManager.notifyApp(
                        this.app.appLocale.LABEL_ACCESS_DENIED || 'Access Denied',
                        'error'
                    );

                    return Promise.resolve(false);

                } else {
                    // redirect to Login
                    this.appManager.handle401(route.routeConfig.path, {queryParams: route.queryParams});

                    return Promise.resolve(false);
                }
            });
    }
}
