import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';

import { App } from '@wm/core';
import { AppManagerService } from '../services/app.manager.service';

declare const _: any;

@Injectable()
export class PageNotFoundGaurd implements CanActivate {

    constructor(
        private app: App,
        private appManager: AppManagerService
    ) {}

    canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        this.appManager.notifyApp(
            this.app.appLocale.MESSAGE_PAGE_NOT_FOUND || 'The page you are trying to reach is not available',
            'error'
        );
        return Promise.resolve(false);
    }
}
