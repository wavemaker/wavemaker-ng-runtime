import { Injectable, Injector } from '@angular/core';

import { EventNotifier } from '@wm/core';
import { SecurityService } from '@wm/security';
import { HttpService } from '@wm/http';

import { I18nService } from './i18n.service';

declare const _, wm;
declare const _WM_APP_PROPERTIES: any;

const injectorMap = {
    DialogService: wm.core.DialogService,
    i18n: I18nService
};

const enum PROJECT_TYPE {
    APPLICATION = 'APPLICATION',
    PREFAB = 'PREFAB',
    TEMPLATE_BUNDLE = 'TEMPLATEBUNDLE'
}

const noop = (...args) => {};

@Injectable()
export class AppRef {
    Variables: any = {};
    Actions: any = {};
    onAppVariablesReady = noop;
    onSessionTimeout = noop;
    onPageReady = noop;
    onServiceError =  noop;

    projectName: string;
    isPrefabType: boolean;
    isApplicationType: boolean;
    isTemplateBundleType: boolean;

    appLocale: any;

    changeLocale = this.i18nService.setSelectedLocale.bind(this.i18nService);

    private _eventNotifier = new EventNotifier();

    reload() {
        window.location.reload();
    }

    constructor(
        private inj: Injector,
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
        this.httpService.setLocale(this.appLocale);
    }

    public notify(eventName: string, data?: any) {
        this._eventNotifier.notify(eventName, data);
    }

    public getDependency(injToken) {
        if (injectorMap[injToken]) {
            return this.inj.get(injectorMap[injToken]);
        }
        return this.inj.get(injToken);
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

    public subscribe(eventName, callback: (data: any) => void): () => void {
        return this._eventNotifier.subscribe(eventName, callback);
    }
}
