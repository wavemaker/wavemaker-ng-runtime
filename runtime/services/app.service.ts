import { Injectable } from '@angular/core';
import { I18nService } from './i18n.service';
import { HttpService } from '@wm/http';
import { SecurityService } from '@wm/security';

declare const _;

const noop = (...args) => {};

interface AppInternals {
    activePageName: string;
    lastActivePageName: string;
}

@Injectable()
export class App {
    Variables:any;
    Actions:any;
    onAppVariablesReady = noop;
    onSessionTimeout = noop;
    onPageReady = noop;
    onServiceError =  noop;

    internals: AppInternals = {
        activePageName: undefined,
        lastActivePageName: undefined
    };

    changeLocale = this.i18nService.setSelectedLocale.bind(this.i18nService);

    reload() {
        window.location.reload();
    }

    constructor(
        private i18nService: I18nService,
        private httpService: HttpService,
        private securityService: SecurityService
    ) {
        this.httpService.registerOnSessionTimeout(this.on401.bind(this));
    }

    /**
     * triggers the onSessionTimeout callback in app.js
     */
    on401() {
        const userInfo = _.get(this.securityService.get(), 'userInfo');
        // if a previous user exists, a session time out trigerred
        if (!_.isEmpty(userInfo)) {
            this.onSessionTimeout();
        }
    }
}
