import { Injectable, Injector } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';

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
    ConstantService,
    UtilsService,
    DynamicComponentRefProvider,
    StatePersistence,
    Viewport,
    registerFnByExpr
} from '@wm/core';
import { SecurityService } from '@wm/security';

import { WmDefaultRouteReuseStrategy } from '../util/wm-route-reuse-strategy';
import { PipeService } from "./pipe.service";
import {each, get, isEmpty, isString} from "lodash-es";
import * as momentLib from 'moment-timezone/moment-timezone';
import { MODE_CONSTANTS } from '@wm/variables';
const moment = momentLib.default || window['moment'];

const injectorMap = {
    DialogService: AbstractDialogService,
    i18nService: AbstractI18nService,
    PipeService: PipeService,
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
    onBeforeAppReady = noop;
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

    targetPlatform: string;

    appLocale: any;

    changeLocale = this.i18nService.setSelectedLocale.bind(this.i18nService);
    getSelectedLocale = this.i18nService.getSelectedLocale.bind(this.i18nService);
    setTimezone = this.i18nService.setTimezone.bind(this.i18nService);
    setwidgetLocale = this.i18nService.setwidgetLocale.bind(this.i18nService);
    
    setAppMode = (modes: Record<string, string>, shouldPersist = true) => {
        const htmlEl = document.getElementsByTagName('html')[0];
        if (!htmlEl) return;

        (Object.entries(modes)).forEach(([modeKey, modeValue]) => {
            const storageKey = `${MODE_CONSTANTS.MODE_KEY}-${modeKey}`;
            const isDefault = modeValue === MODE_CONSTANTS.LIGHT || modeValue === MODE_CONSTANTS.DEFAULT;

            if (isDefault) {
                if (shouldPersist) localStorage.removeItem(storageKey);
                htmlEl.removeAttribute(modeKey);
            } else {
                if (shouldPersist) localStorage.setItem(storageKey, modeValue);
                htmlEl.setAttribute(modeKey, modeValue);
            }
        });
    };

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
        private securityService: SecurityService,
        private routeReuseStrategy: RouteReuseStrategy
    ) {

        const wmProjectProperties = getWmProjectProperties();

        this.projectName = wmProjectProperties.name;
        this.isPrefabType = wmProjectProperties.type === PROJECT_TYPE.PREFAB;
        this.isApplicationType = wmProjectProperties.type === PROJECT_TYPE.APPLICATION;
        this.isTemplateBundleType = wmProjectProperties.type === PROJECT_TYPE.TEMPLATE_BUNDLE;
        this.targetPlatform = wmProjectProperties.platformType;

        this.httpService.registerOnSessionTimeout(this.on401.bind(this));

        this.appLocale = this.i18nService.getAppLocale();
        this.httpService.setLocale(this.appLocale);
    }

    public clearPageCache(pageName?: string) {
        if(this.routeReuseStrategy instanceof WmDefaultRouteReuseStrategy) {
            (this.routeReuseStrategy as WmDefaultRouteReuseStrategy).reset(pageName);
        }
    }

    public notify(eventName: string, ...data: Array<any>) {
        this._eventNotifier.notify.apply(this._eventNotifier, arguments);
    }
    
    public importModule(moduleName: string) {
        if (moduleName === 'moment') {
            return moment;
        }
    }

    public getDependency(injToken) {
        if (isString(injToken)) {
            if (injToken === 'HttpService') {
                return getHttpDependency.call(this);
            }
            let providerInstance = injectorMap[injToken] && this.inj.get(injectorMap[injToken]);
            if (!providerInstance && this.inj['records']?.values) {
                const values = this.inj['records'].values();
                let next = values?.next();
                while (next && !next.done) {
                    if (next?.value?.value?.constructor?.SERVICE_NAME === injToken) {
                        return next.value.value;
                    }
                    next = values.next();
                }
            }
            return providerInstance;
        }
        return this.inj.get(injToken);
    }

    /**
     * triggers the onSessionTimeout callback in app.js
     */
    on401() {
        const userInfo = get(this.securityService.get(), 'userInfo');
        // if a previous user exists, a session time out triggered
        if (!isEmpty(userInfo)) {
            this.onSessionTimeout();
        }
    }

    public subscribe(eventName, callback: (data: any) => void): () => void {
        return this._eventNotifier.subscribe(eventName, callback);
    }

    public notifyApp(template, type, title) {
        const notificationAction = get(this, 'Actions.appNotification');
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

    /**
     * function to register bind expressions from app variables
     * it will be called from app.js in generated angular app
     * @param expressions, map of bind expression vs generated function
     */
    public registerExpressions(expressions) {
        each(expressions, (fn, expr) => {
            registerFnByExpr(expr, fn[0], fn[1]);
        });
    }
}
