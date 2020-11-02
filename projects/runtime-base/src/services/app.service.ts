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
    ConstantService,
    UtilsService,
    DynamicComponentRefProvider,
    StatePersistence,
    Viewport
} from '@wm/core';
import { SecurityService } from '@wm/security';

declare const _;

const injectorMap = {
    DialogService: AbstractDialogService,
    i18nService: AbstractI18nService,
    statePersistence: StatePersistence,
    SpinnerService: AbstractSpinnerService,
    StatePersistenceService: StatePersistence,
    Viewport: Viewport,
    ToasterService: AbstractToasterService,
    Utils: UtilsService,
    CONSTANTS: ConstantService,
    FIELD_TYPE: FieldTypeService,
    FIELD_WIDGET: FieldWidgetService,
    DynamicComponentService: DynamicComponentRefProvider
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
    onBeforePageLeave = noop;
    onBeforeServiceCall =  noop;
    onServiceSuccess =  noop;
    onServiceError =  noop;
    dynamicComponentContainerRef = {};

    projectName: string;
    isPrefabType: boolean;
    isApplicationType: boolean;
    isTabletApplicationType: boolean;
    isTemplateBundleType: boolean;

    appLocale: any;

    changeLocale = this.i18nService.setSelectedLocale.bind(this.i18nService);
    getSelectedLocale = this.i18nService.getSelectedLocale.bind(this.i18nService);

    private _eventNotifier = new EventNotifier();

    landingPageName = getWmProjectProperties().homePage;

    reload() {
        window.location.reload();
    }

    constructor(
        private inj: Injector,
        private i18nService: AbstractI18nService,
        private statePersistence: StatePersistence,
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
            let providerInstance = injectorMap[injToken] && this.inj.get(injectorMap[injToken]);
            if (!providerInstance && this.inj['_providers']) {
                _.forEach(this.inj['_providers'], val => {
                    if (_.isObject(val)) {
                        if (val.__proto__.constructor.SERVICE_NAME === injToken) {
                            providerInstance = val;
                            return false;
                        }
                    }
                });
            }
            return providerInstance;
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
        const EXCLUDE_NOTIFICATION_MESSAGES = ['PROCESS_REJECTED_IN_QUEUE'];
        const skipDefaultNotification = EXCLUDE_NOTIFICATION_MESSAGES.indexOf(template) !== -1;
        if (notificationAction) {
            // do not notify the error to the app, just throw it in console
            if (skipDefaultNotification) {
                console.warn('App Error', template);
                return;
            }
            type = type || 'success';
            template = notificationAction.getMessage() || template;
            notificationAction.invoke({
                message: template,
                title: isDefined(title) ? title : type.toUpperCase(),
                class: type,
                // If the type is error do not close the toastr
                duration: type.toUpperCase() === 'ERROR' ? 0 : undefined
            });
        } else {
            console.warn('The default Action "appNotification" doesn\'t exist in the app. App notified following error:\n', template);
        }
    }
}
