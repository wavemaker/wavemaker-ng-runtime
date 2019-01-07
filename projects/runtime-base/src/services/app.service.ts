import { Injectable, Injector } from '@angular/core';

import {
    AbstractDialogService,
    AbstractHttpService,
    AbstractI18nService,
    AbstractSpinnerService,
    AbstractToasterService,
    EventNotifier,
    FieldTypeService,
    FieldWidgetService,
    getWmProjectProperties,
    isDefined,
    isString,
    UtilsService
} from '@wm/core';
import { SecurityService } from '@wm/security';

declare const _;

const injectorMap = {
    DialogService: AbstractDialogService,
    i18nService: AbstractI18nService,
    SpinnerService: AbstractSpinnerService,
    ToasterService: AbstractToasterService,
    Utils: UtilsService,
    FIELD_TYPE: FieldTypeService,
    FIELD_WIDGET: FieldWidgetService
};

const enum PROJECT_TYPE {
    APPLICATION = 'APPLICATION',
    PREFAB = 'PREFAB',
    TEMPLATE_BUNDLE = 'TEMPLATEBUNDLE'
}

const noop = (...args) => {};

// Wraps httpService to behave as angular 1.x $http service.
const getHttpDependency = function() {
    const httpService = this.httpService;
    const fn = function (key, options?) {
        const args = Array.from(arguments).slice(1);
        return Promise.resolve(httpService[key].apply(httpService, args));
    };
    const $http = function () {
        return fn.apply(undefined, ['send', ...Array.from(arguments)]);
    };
    ['get', 'post', 'head', 'put', 'delete', 'jsonp', 'patch'].forEach(key => $http[key] = fn.bind(undefined, key));
    return $http;
};

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

    landingPageName: string;

    reload() {
        window.location.reload();
    }

    constructor(
        private inj: Injector,
        private i18nService: AbstractI18nService,
        private httpService: AbstractHttpService,
        private securityService: SecurityService
    ) {

        const wmProjectProperties = getWmProjectProperties();

        this.projectName = wmProjectProperties.name;
        this.isPrefabType = wmProjectProperties.type === PROJECT_TYPE.PREFAB;
        this.isApplicationType = wmProjectProperties.type === PROJECT_TYPE.APPLICATION;
        this.isTemplateBundleType = wmProjectProperties.type === PROJECT_TYPE.TEMPLATE_BUNDLE;

        this.httpService.registerOnSessionTimeout(this.on401.bind(this));

        this.appLocale = this.i18nService.getAppLocale();
        this.httpService.setLocale(this.appLocale);
    }

    public notify(eventName: string, ...data: Array<any>) {
        this._eventNotifier.notify.apply(this._eventNotifier, arguments);
    }

    public getDependency(injToken) {
        if (isString(injToken)) {
            if (injToken === 'HttpService') {
                return getHttpDependency.call(this);
            }
            return injectorMap[injToken] && this.inj.get(injectorMap[injToken]);
        }
        return this.inj.get(injToken);
    }

    /**
     * triggers the onSessionTimeout callback in app.js
     */
    on401() {
        const userInfo = _.get(this.securityService.get(), 'userInfo');
        // if a previous user exists, a session time out triggered
        if (!_.isEmpty(userInfo)) {
            this.onSessionTimeout();
        }
    }

    public subscribe(eventName, callback: (data: any) => void): () => void {
        return this._eventNotifier.subscribe(eventName, callback);
    }

    public notifyApp(template, type, title) {
        const notificationAction = _.get(this, 'Actions.appNotification');
        if (notificationAction) {
            type = type || 'success';
            notificationAction.invoke({
                message: template,
                title: isDefined(title) ? title : type.toUpperCase(),
                class: type,
                // If the type is error do not close the toastr
                duration: type.toUpperCase() === 'ERROR' ? 0 : undefined
            });
        } else {
            console.warn('The default Action "appNotification" doesn\'t exist in the app.');
        }
    }
}
