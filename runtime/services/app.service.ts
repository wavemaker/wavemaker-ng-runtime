import { Injectable } from '@angular/core';

import { IAppInternals } from '@wm/core';
import { SecurityService } from '@wm/security';
import { HttpService } from '@wm/http';

import { I18nService } from './i18n.service';

declare const _;
declare const _WM_APP_PROPERTIES: any;

const enum PROJECT_TYPE {
    APPLICATION = 'APPLICATION',
    PREFAB = 'PREFAB',
    TEMPLATE_BUNDLE = 'TEMPLATEBUNDLE'
}

const noop = (...args) => {};

@Injectable()
export class AppRef {
    Variables: any;
    Actions: any;
    onAppVariablesReady = noop;
    onSessionTimeout = noop;
    onPageReady = noop;
    onServiceError =  noop;

    projectName: string;
    isPrefabType: boolean;
    isApplicationType: boolean;
    isTemplateBundleType: boolean;

    appLocale: any;

    internals: IAppInternals = {
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

        this.projectName = _WM_APP_PROPERTIES.name;
        this.isPrefabType = _WM_APP_PROPERTIES.type === PROJECT_TYPE.PREFAB;
        this.isApplicationType = _WM_APP_PROPERTIES.type === PROJECT_TYPE.APPLICATION;
        this.isTemplateBundleType = _WM_APP_PROPERTIES.type === PROJECT_TYPE.TEMPLATE_BUNDLE;

        this.httpService.registerOnSessionTimeout(this.on401.bind(this));

        this.appLocale = this.i18nService.getAppLocale();
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
