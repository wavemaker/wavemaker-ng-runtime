import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import {
    AbstractDialogService,
    AbstractHttpService,
    AbstractI18nService,
    AbstractSpinnerService,
    App,
    fetchContent,
    isDefined,
    triggerFn,
    $appDigest,
    getWmProjectProperties
} from '@wm/core';
import { SecurityService } from '@wm/security';
import { CONSTANTS, $rootScope, routerService,  MetadataService, VariablesService } from '@wm/variables';
import {extend, forEach, get, isEmpty, isObject, isUndefined, merge, trim} from "lodash-es";

enum POST_MESSAGES {
    HIDE_TEMPLATES_SHOW_CASE = 'hide-templates-show-case',
    SHOW_TEMPLATES_SHOW_CASE = 'show-templates-show-case',
    UPDATE_LOCATION          = 'update-location-path',
    SELECT_TEMPLATE          = 'select-template',
    TEMPLATEBUNDLE_CONFIG    = 'template-bundle-config',
    ON_LOAD                  = 'on-load'
}

@Injectable()
export class AppManagerService {
    static readonly SERVICE_NAME = 'AppManagerService';

    private appVariablesLoaded = false;
    private appVariablesFired = false;
    private _noRedirect = false;
    private templates: Array<any>;
    private lastLoggedUserId;

    constructor(
        private $http: AbstractHttpService,
        private $security: SecurityService,
        private $dialog: AbstractDialogService,
        private $router: Router,
        private $app: App,
        private $variables: VariablesService,
        private $metadata: MetadataService,
        private $spinner: AbstractSpinnerService,
        private $i18n: AbstractI18nService,
        private $datePipe: DatePipe,
    ) {
        // register method to invoke on session timeout
        this.$http.registerOnSessionTimeout(this.handle401.bind(this));

        this.$variables.registerDependency('appManager', this);

        this.$app.subscribe('toggle-variable-state', (data) => {
            const variable = data.variable,
                active = data.active;
            if (!isEmpty(trim(variable.spinnerContext))) {
                if (active) {
                    let spinnerExists;
                    // WMS-21117 : Do not trigger spinner, if the current variable is same as spinner which is in context
                    if (variable._spinnerId && variable._spinnerId.length) {
                        forEach(variable._spinnerId, (item) => {
                            if (item.slice(0, item.lastIndexOf('_')) === variable._id && (this.$spinner as any).messagesByContext && (this.$spinner as any).messagesByContext[variable.spinnerContext] &&
                                (variable.spinnerMessage === (this.$spinner as any).messagesByContext[variable.spinnerContext]["finalMessage"] || variable.spinnerMessage === (this.$spinner as any).messagesByContext[variable.spinnerContext][item])) {
                                spinnerExists = true;
                                return;
                            }
                        });
                    }
                    if (!spinnerExists) {
                        variable._spinnerId = variable._spinnerId || [];
                        const spinnerId = this.$spinner.show(variable.spinnerMessage,
                            variable._id + '_' + Date.now(),
                            variable.spinnerclass,
                            variable.spinnerContext);
                        variable._spinnerId.push(spinnerId);
                    }
                } else {
                    this.$spinner.hide(variable._spinnerId.shift());
                }
            }
        });
        this.$app.subscribe('userLoggedIn', () => {
            this.setLandingPage();
            if (this.lastLoggedUserId) {
                this.$security.getConfig(config => {
                    if(config && config.userInfo.userId !== this.lastLoggedUserId) {
                        this.$app.clearPageCache();
                    }
                }, null);
            }
        });
        this.$app.subscribe('userLoggedOut', () => this.setLandingPage().then(() => {
            this.$app.clearPageCache();
        }));
        this.$app.subscribe('http401', (d = {}) => this.handle401(d.page, d.options));
    }

    /**
     * On session timeout, if the session timeout config is set to a dialog, then open login dialog
     */
    private showLoginDialog() {
        this.$spinner.hide('globalSpinner');
        // Removing the close all dialogs call, so the existing dialogs remain open and
        // the login dialog comes on top of it.
        this.$dialog.open('CommonLoginDialog');
        // Since the login dialog is closed and opened its updated property isn't read by angular.
        // Hence we trigger the digest cycle
        $appDigest();
    }

    loadAppJS() {

    }

    loadCommonPage() {

    }

    loadSecurityConfig(forceFlag?: boolean) {
        return this.$security.load(forceFlag).then((r) => {
            if (!this.$app.landingPageName) {
                this.setLandingPage();
            }
            return r;
        });
    }

    loadMetadata() {
        return this.$metadata.load();
    }

    loadAppVariables(variables?: any) {
        if (this.appVariablesLoaded) {
            return Promise.resolve();
        }

        const init = response => {
            const data = this.$variables.register('app', response, this.$app);
            // not assigning directly to this.$app to keep the reference in tact
            extend(this.$app.Variables, data.Variables);
            extend(this.$app.Actions, data.Actions);
            this.updateLoggedInUserVariable();
            this.updateSupportedLocaleVariable();
            this.appVariablesLoaded = true;
            this.appVariablesFired = false;
        };

        if (isDefined(variables)) {
            init(variables);
            return Promise.resolve();
        }

        return this.$http.get('./app.variables.json').then(response => init(response));
    }

    /**
     * getter and setter for the property appVariablesFired
     * this flag determines if the app variables(with startUpdate:true) have been fired
     * they should get fired only once through app lifecycle
     * @param {boolean} isFired
     * @returns {boolean}
     */
    isAppVariablesFired(isFired?: boolean) {
        if (isDefined(isFired)) {
            this.appVariablesFired = isFired;
        }
        return this.appVariablesFired;
    }

    private clearLoggedInUserVariable(variable) {
        variable.isAuthenticated = false;
        variable.roles           = [];
        variable.name            = undefined;
        variable.id              = undefined;
        variable.tenantId        = undefined;
    }

    private updateLoggedInUserVariable() {
        const loggedInUser = get(this.$app, 'Variables.loggedInUser.dataSet');

        // sanity check
        if (!loggedInUser) {
            return;
        }
        return this.$security.load().then(() => {
            const securityConfig = this.$security.get();
            if (securityConfig && securityConfig.securityEnabled && securityConfig.authenticated) {
                loggedInUser.isAuthenticated = securityConfig.authenticated;
                loggedInUser.roles           = securityConfig.userInfo.userRoles;
                loggedInUser.name            = securityConfig.userInfo.userName;
                loggedInUser.id              = securityConfig.userInfo.userId;
                loggedInUser.tenantId        = securityConfig.userInfo.tenantId;
                loggedInUser.userAttributes  = securityConfig.userInfo.userAttributes; // assign the extra userAttributes for custom usage.
            } else {
                this.clearLoggedInUserVariable(loggedInUser);
                loggedInUser.isSecurityEnabled = securityConfig && securityConfig.securityEnabled;
                throw null;
            }
            return securityConfig;
        }).catch(err => {
            loggedInUser.isAuthenticated = false;
            loggedInUser.roles           = [];
            loggedInUser.name            = undefined;
            loggedInUser.id              = undefined;
            loggedInUser.tenantId        = undefined;
            loggedInUser.userAttributes  = {};
        });
    }

    /**
     * Overriding the app variable supported locale with the wmProperties i18n DataValues
     *
     * TODO[Vibhu]:
     * Can write a simple migration to sync the supportedLocale variable with '_WM_APP_PROPERTIES.supportedLanguages'
     * Hence, this may not be required
     *
     */
    updateSupportedLocaleVariable() {
        const supportedLocaleVar = get(this.$app, 'Variables.supportedLocale');
    }

    handleSSOLogin(config, options) {
        const SSO_URL = 'services/security/ssologin',
            PREVIEW_WINDOW_NAME = 'WM_PREVIEW_WINDOW';
        let page = '',
            queryParams;

        // do not provide redirectTo page if fetching HOME page resulted 401
        // on app load, by default Home page is loaded

            /*
             * For preview, this.$security.getRedirectedRouteQueryParams() gets the queryparams form the activated route(pagewrappercomponent)
             * For deployed app, canactivate guard resolved to false and gets the queryparams from the canactivate gurard(no active route component)
             */
            queryParams = (options && options.queryParams) || this.$security.getRedirectedRouteQueryParams();
            queryParams = this.$security.getQueryString(queryParams);
            queryParams = queryParams ? '?' + queryParams : '';

            const redirectPage = this.$security.getCurrentRoutePage();
            const homePage = getWmProjectProperties().homePage;
            if (redirectPage && (redirectPage !== homePage || !!queryParams)) {
                page = '?redirectPage=' + encodeURIComponent(redirectPage);
            }

            // showing a redirecting message
            document.body.textContent = get(this.getAppLocale(), ['MESSAGE_LOGIN_REDIRECTION']) || 'Redirecting to sso login...';
            // appending redirect to page and page params
            const ssoUrl = this.getDeployedURL() + SSO_URL + page + queryParams;
            /*
             * remove iFrame when redirected to IdP login page.
             * this is being done as IDPs do not allow to get themselves loaded into iFrames.
             * remove-toolbar has been assigned with a window name WM_PREVIEW_WINDOW, check if the iframe is our toolbar related and
             * safely change the location of the parent toolbar with current url.
             */
            if (window.self !== window.top) {
                try {
                    if (window.parent && window.location.origin === window.parent.origin){
                        if(window.parent.name === PREVIEW_WINDOW_NAME) {
                            window.parent.location.href = window.self.location.href;
                            window.parent.name = ""
                        }
                    } else {
                        window.location.href = ssoUrl
                    }
                } catch (error) {
                    window.location.href = ssoUrl;
                }
            } else {
                window.location.href = ssoUrl;
            }
    }

    /**
     * Handles the app when a XHR request returns 401 response
     * If no user was logged in before 401 occurred, First time Login is simulated
     * Else, a session timeout has occurred and the same is simulated
     * @param page  if provided, represents the page name for which XHR request returned 401, on re-login
     *              if not provided, a service request returned 401
     * @param onSuccess success handler
     * @param onError error handler
     */
    handle401(page?, options?) {
        let sessionTimeoutConfig,
            sessionTimeoutMethod,
            loginConfig,
            loginMethod;
        const LOGIN_METHOD = {
                'DIALOG' : 'DIALOG',
                'PAGE'   : 'PAGE',
                'SSO'    : 'SSO'
            };

        const config = this.$security.get();
        let queryParamsObj = {};
        loginConfig = config.loginConfig;
        this.lastLoggedUserId = config.userInfo && config.userInfo.userId;
        // if user found, 401 was thrown after session time
        if (config.userInfo && config.userInfo.userName) {
            config.authenticated = false;
            sessionTimeoutConfig = loginConfig.sessionTimeout || {'type': LOGIN_METHOD.DIALOG};
            sessionTimeoutMethod = sessionTimeoutConfig.type.toUpperCase();
            switch (sessionTimeoutMethod) {
                case LOGIN_METHOD.DIALOG:
                    this.showLoginDialog();
                    break;
                case LOGIN_METHOD.PAGE:
                    if (!page) {
                        page = this.$security.getCurrentRoutePage();
                    }
                    queryParamsObj['redirectTo'] = page;
                    // Adding query params(page params of page being redirected to) to the URL.
                    queryParamsObj = merge(queryParamsObj, this.$security.getRedirectedRouteQueryParams());
                    // the redirect page should not be same as session timeout login page
                    if ( page !== sessionTimeoutConfig.pageName) {
                        this.$router.navigate([sessionTimeoutConfig.pageName], {queryParams: queryParamsObj});
                    }
                    break;
                case LOGIN_METHOD.SSO:
                    this.handleSSOLogin(config, options);
                    break;
            }
            this.setLandingPage();
        } else {
            // if no user found, 401 was thrown for first time login
            loginMethod = loginConfig.type.toUpperCase();
            switch (loginMethod) {
                case LOGIN_METHOD.DIALOG:
                    // Through loginDialog, user will remain in the current state and failed calls will be executed post login through LoginVariableService.
                    // NOTE: user will be redirected to respective landing page only if dialog is opened manually(not through a failed 401 call).
                    this.noRedirect(true);
                    this.showLoginDialog();
                    break;
                case LOGIN_METHOD.PAGE:
                    // do not provide redirectTo page if fetching HOME page resulted 401
                    // on app load, by default Home page is loaded
                    page = this.$security.getRedirectPage(config, page);
                    queryParamsObj['redirectTo'] = page;
                    const extraQueryParams = (options && options.queryParams) || this.$security.getRedirectedRouteQueryParams();
                    queryParamsObj = merge(queryParamsObj, extraQueryParams);
                    this.$router.navigate([loginConfig.pageName], {queryParams: queryParamsObj});
                    this.$app.landingPageName = loginConfig.pageName;
                    break;
                case LOGIN_METHOD.SSO:
                    this.handleSSOLogin(config, options);
                    break;
            }
        }
    }

    /**
     * Updates data dependent on logged in user
     * Reloads security config, metadata
     * Updates the loggedInUserVariable
     * @returns {Promise<void>}
     */
    reloadAppData() {
        return this.loadSecurityConfig(true).then(() => {
            return this.loadMetadata().then(() => {
                return this.updateLoggedInUserVariable();
            });
        });
    }

    noRedirect(value?: boolean) {
        if (isUndefined(value)) {
            return this._noRedirect;
        }

        this._noRedirect = value;
        return this._noRedirect;
    }

    /**
     * invokes session failure requests
     */
    executeSessionFailureRequests() {
        this.$http.executeSessionFailureRequests();
    }

    pushToSessionFailureRequests(callback) {
        this.$http.pushToSessionFailureQueue(callback);
    }

    public getDeployedURL() {
        return this.$app.deployedUrl ? this.$app.deployedUrl : $rootScope.project.deployedUrl;
    }

    /**
     * Fetches the customurlscheme for a mobile app
     * which is used for redirection back to the app from browser in implicit oAuth flow
     * @returns {string}
     */
    public getCustomUrlScheme() {
        return this.$app.customUrlScheme;
    }

    notify(eventName, data) {
        this.$app.notify(eventName, data);
    }

    subscribe(eventName, data) {
        return this.$app.subscribe(eventName, data);
    }

    getActivePage() {
        return this.$app.activePage;
    }

    getAppLocale() {
        return this.$app.appLocale;
    }

    getSelectedLocale() {
        return this.$i18n.getSelectedLocale();
    }

    notifyApp(template, type, title?) {
        this.$app.notifyApp(template, type, title);
    }

    /**
     * Triggers the onBeforeService method defined in app.js of the app
     * @param requestParams
     */
    appOnBeforeServiceCall(requestParams: any) {
        return triggerFn(this.$app.onBeforeServiceCall, requestParams);
    }

    /**
     * Triggers the onServiceSuccess method defined in app.js of the app
     * @param data
     * @param xhrObj
     */
    appOnServiceSuccess(data: any, xhrObj: any) {
        return triggerFn(this.$app.onServiceSuccess, data, xhrObj);
    }

    /**
     * Triggers the onServiceError method defined in app.js of the app
     * @param data
     * @param xhrOb
     */
    appOnServiceError(data: any, xhrOb?: any) {
        return triggerFn(this.$app.onServiceError, data, xhrOb);
    }

    /**
     * Triggers the appVariablesReady method defined in app.js of the app
     */
    appVariablesReady() {
        triggerFn(this.$app.onAppVariablesReady);
    }

    /**
     * Triggers the onBeforeAppReady method defined in app.js of the app
     */
    beforeAppReady() {
        triggerFn(this.$app.onBeforeAppReady);
    }

    /**
     * Returns the pipe based on the input
     */
    getPipe(pipe) {
        if (pipe === 'date') {
            return this.$datePipe;
        }
    }

    private setLandingPage() {
        return this.$security.getPageByLoggedInUser().then(p => this.$app.landingPageName = <string> p);
    }

    /**
     * return true if prefab type app
     * @returns {boolean}
     */
    isPrefabType() {
        return this.$app.isPrefabType;
    }

    /**
     * return true if template bundle type app
     * @returns {boolean}
     */
    isTemplateBundleType() {
        return this.$app.isTemplateBundleType;
    }

    postMessage(content) {
        window.top.postMessage(content, '*');
    }

    showTemplate(idx) {
        const template = this.templates[idx];
        // scope.activeTemplateIndex = idx;
        this.$router.navigate([template.id]);
    }
    postTemplateBundleInfo() {

        window.onmessage = (evt) => {
            const msgData = evt.data;

            if (!isObject(msgData)) {
                return;
            }

            // @ts-ignore
            const key = msgData.key;

            switch (key) {
                case POST_MESSAGES.HIDE_TEMPLATES_SHOW_CASE:
                    // scope.hideShowCase = true;
                    break;
                case POST_MESSAGES.SELECT_TEMPLATE:
                    // @ts-ignore
                    this.showTemplate(msgData.templateIndex);
                    break;
            }
        };

        setTimeout(() => {
            this.postMessage({key: POST_MESSAGES.ON_LOAD});
        });

        return fetchContent('json', './config.json', true, response => {
            this.templates = [];
            if (!response.error) {
                this.templates = response.templates;
                this.postMessage({'key': POST_MESSAGES.TEMPLATEBUNDLE_CONFIG, 'config': response});
            }
        });
    }

    postAppTypeInfo() {
        if (this.isTemplateBundleType()) {
            return this.postTemplateBundleInfo();
        }
    }
}
