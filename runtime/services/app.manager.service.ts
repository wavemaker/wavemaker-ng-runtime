import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '@wm/http';
import { SecurityService } from '@wm/security';
import { $rootScope, MetadataService, VariablesService } from '@wm/variables';
import { AbstractDialogService, AbstractI18nService, App, isDefined, triggerFn } from '@wm/core';

import { SpinnerService } from './spinner.service';

declare const _;

@Injectable()
export class AppManagerService {

    private appVariablesLoaded: boolean = false;
    private appVariablesFired: boolean = false;
    private _noRedirect: boolean = false;

    constructor(
        private $http: HttpService,
        private $security: SecurityService,
        private $dialog: AbstractDialogService,
        private $router: Router,
        private $app: App,
        private $variables: VariablesService,
        private $metadata: MetadataService,
        private $spinner: SpinnerService,
        private $i18n: AbstractI18nService
    ) {
        // register method to invoke on session timeout
        this.$http.registerOnSessionTimeout(this.handle401.bind(this));

        this.$variables.registerDependency('appManager', this);

        this.$app.subscribe('toggle-variable-state', (data) => {
            const variable = data.variable,
                active = data.active;
            if (!_.isEmpty(_.trim(variable.spinnerContext))) {
                if (active) {
                    variable._spinnerId = this.$spinner.show(variable.spinnerMessage,
                        variable._id + '_' + Date.now(),
                        variable.spinnerclass,
                        variable.spinnerContext);
                } else {
                    this.$spinner.hide(variable._spinnerId);
                }
            }
        });
    }

    /**
     * On session timeout, if the session timeout config is set to a dialog, then open login dialog
     */
    private showLoginDialog() {
        this.$spinner.hide('globalSpinner');
        this.$dialog.closeAllDialogs();
        this.$dialog.open('CommonLoginDialog');
    }

    loadAppJS() {

    }

    loadCommonPage() {

    }

    loadSecurityConfig() {
        return this.$security.load();
    }

    loadMetadata() {
        return this.$metadata.load();
    }

    loadAppVariables() {
        if (this.appVariablesLoaded) {
            return Promise.resolve();
        }
        return this.$http.get('./app.variables.json')
            .then(response => {
                const data = this.$variables.register('app', response, this.$app);
                // not assigning directly to this.$app to keep the reference in tact
                _.extend(this.$app.Variables, data.Variables);
                _.extend(this.$app.Actions, data.Actions);
                this.updateLoggedInUserVariable();
                this.updateSupportedLocaleVariable();
                this.appVariablesLoaded = true;
                this.appVariablesFired = false;
            });
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

    private updateLoggedInUserVariable() {
        const loggedInUser = _.get(this.$app, 'Variables.loggedInUser.dataSet');

        // sanity check
        if (!loggedInUser) {
            return;
        }

        const securityConfig = this.$security.get();
        if (securityConfig && securityConfig.securityEnabled && securityConfig.authenticated) {
            loggedInUser.isAuthenticated = securityConfig.authenticated;
            loggedInUser.roles           = securityConfig.userInfo.userRoles;
            loggedInUser.name            = securityConfig.userInfo.userName;
            loggedInUser.id              = securityConfig.userInfo.userId;
            loggedInUser.tenantId        = securityConfig.userInfo.tenantId;
        } else {
            loggedInUser.isAuthenticated = false;
            loggedInUser.roles           = [];
            loggedInUser.name            = undefined;
            loggedInUser.id              = undefined;
            loggedInUser.tenantId        = undefined;
        }
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
        const supportedLocaleVar = _.get(this.$app, 'Variables.supportedLocale');
    }

    handleSSOLogin(config) {
        const SSO_URL = 'services/security/ssologin',
            PREVIEW_WINDOW_NAME = 'WM_PREVIEW_WINDOW';
        let page,
            pageParams;

        // do not provide redirectTo page if fetching HOME page resulted 401
        // on app load, by default Home page is loaded
        page = this.$security.getRedirectPage(config);
        page = page ? '?redirectPage=' + encodeURIComponent(page) : '';
        // pageParams = that.getQueryString($location.search());
        pageParams = pageParams ? '?' + encodeURIComponent(pageParams) : '';
        // showing a redirecting message
        document.body.textContent = _.get(this.getAppLocale(), ['MESSAGE_LOGIN_REDIRECTION']) || 'Redirecting to sso login...';
        // appending redirect to page and page params
        const ssoUrl = this.getDeployedURL() + SSO_URL + page + pageParams;
        /*
         * remove iFrame when redirected to IdP login page.
         * this is being done as IDPs do not allow to get themselves loaded into iFrames.
         * remove-toolbar has been assigned with a window name WM_PREVIEW_WINDOW, check if the iframe is our toolbar related and
         * safely change the location of the parent toolbar with current url.
         */
        if (window.self !== window.top && window.parent.name === PREVIEW_WINDOW_NAME) {
            window.parent.location.href = window.self.location.href;
            window.parent.name = '';
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
        const that = this,
            LOGIN_METHOD = {
                'DIALOG' : 'DIALOG',
                'PAGE'   : 'PAGE',
                'SSO'    : 'SSO'
            };

        const config = this.$security.get();
        loginConfig = config.loginConfig;
        // if user found, 401 was thrown after session time
        if (config.userInfo && config.userInfo.userName) {
            config.authenticated = false;
            sessionTimeoutConfig = loginConfig.sessionTimeout || {'type': LOGIN_METHOD.DIALOG};
            sessionTimeoutMethod = sessionTimeoutConfig.type.toUpperCase();
            switch (sessionTimeoutMethod) {
                case LOGIN_METHOD.DIALOG:
                    that.showLoginDialog();
                    break;
                case LOGIN_METHOD.PAGE:
                    if (!page) {
                        page = that.$security.getCurrentRoutePage();
                    }
                    that.$router.navigate([sessionTimeoutConfig.pageName], {queryParams: {redirectTo: page}});
                    break;
                case LOGIN_METHOD.SSO:
                    this.handleSSOLogin(config);
                    break;
            }
        } else {
            // if no user found, 401 was thrown for first time login
            loginMethod = loginConfig.type.toUpperCase();
            switch (loginMethod) {
                case LOGIN_METHOD.DIALOG:
                    // Through loginDialog, user will remain in the current state and failed calls will be executed post login through LoginVariableService.
                    // NOTE: user will be redirected to respective landing page only if dialog is opened manually(not through a failed 401 call).
                    this.noRedirect(true);
                    that.showLoginDialog();
                    break;
                case LOGIN_METHOD.PAGE:
                    // do not provide redirectTo page if fetching HOME page resulted 401
                    // on app load, by default Home page is loaded
                    page = that.$security.getRedirectPage(config);
                    that.$router.navigate([loginConfig.pageName], {queryParams: {redirectTo: page}});
                    break;
                case LOGIN_METHOD.SSO:
                    this.handleSSOLogin(config);
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
        return this.loadSecurityConfig().then(() => {
            return this.loadMetadata().then(() => {
                this.updateLoggedInUserVariable();
            });
        });
    }

    noRedirect(value?: boolean) {
        if (_.isUndefined(value)) {
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

    notify(eventName, data) {
        this.$app.notify(eventName, data);
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
     * Triggers the onServiceError method defined in app.js of the app
     * @param variable
     * @param data
     * @param xhrOb
     */
    appOnServiceError(variable: any, data: any, xhrOb?: any) {
        triggerFn(this.$app.onServiceError, variable, data, xhrOb);
    }
}