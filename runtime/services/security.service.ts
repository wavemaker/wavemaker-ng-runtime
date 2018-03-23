declare const _WM_APP_PROPERTIES, _;
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { triggerFn } from '@utils/utils';

@Injectable()
export class SecurityService {
    config;

    constructor(private httpClient: HttpClient, private routerService: Router, private activatedRoute: ActivatedRoute) {}

    isLoaded() {
        return this.config ? true : false;
    }

    get() {
        return this.config;
    }

    load() {
        return new Promise((resolve, reject) => {
            this.httpClient.get('./services/security/info').toPromise().then((response) => {
                this.config = response;
                resolve(response);
            });
        });
    }

    getCurrentRoutePage() {
        let page;
        this.activatedRoute.paramMap
            .switchMap((params) =>
                page = params.get('pageName'));
        return page;
    }

    getCurrentRouteQueryParam(paramName) {
        let paramVal;
        this.activatedRoute.queryParamMap
            .switchMap((params) =>
                paramVal = params.get(paramName));
        return paramVal;
    }

    getRedirectPage(config, page?) {
        const homePage = _WM_APP_PROPERTIES.homePage,
            loginPage = _.get(config, 'loginConfig.pageName');
        let prevRedirectPage,
            redirectPage = page || this.getCurrentRoutePage();

        // if user is already on Home page or Login page, they should not be redirected to that page, hence return undefined
        if (redirectPage === homePage || redirectPage === loginPage) {
            /*
             * find previous redirect page from URL, if exists, user should redirect to that page.
             * USE CASE:
             *  user is on http://localhost:8080/app/#/Login?redirectTo=page
             *  a variable call fails resulting 401
             *  in this case, redirectTo page should be 'page' and not undefined
             */
            prevRedirectPage = this.getCurrentRouteQueryParam('redirectTo');
            redirectPage = !_.isEmpty(prevRedirectPage) ? prevRedirectPage : undefined;
        }

        return redirectPage;
    }

    // accepts query object like {a:1, b:2} and returns a=1&b=2 string
    getQueryString(queryObject) {
        const params = [];
        _.forEach(queryObject, function (value, key) {
            params.push(key + '=' + value);
        });
        return _.join(params, '&');
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
    handle401(page, onSuccess?, onError?) {
        let sessionTimeoutConfig,
            sessionTimeoutMethod,
            loginConfig,
            loginMethod,
            ssoUrl,
            pageParams;
        const LOGIN_METHOD = {
            'DIALOG' : 'DIALOG',
            'PAGE'   : 'PAGE',
            'SSO'    : 'SSO'
        };

        const config = this.get();
        loginConfig = config.loginConfig;
        // if user found, 401 was thrown after session time
        if (config.userInfo && config.userInfo.userName) {
            config.authenticated = false;
            sessionTimeoutConfig = loginConfig.sessionTimeout || {'type': LOGIN_METHOD.DIALOG};
            sessionTimeoutMethod = sessionTimeoutConfig.type.toUpperCase();
            // triggerFn($rs.onSessionTimeout);
            // $rs.$emit('on-sessionTimeout');
            if (sessionTimeoutMethod === LOGIN_METHOD.DIALOG) {
                if (page) {
                    // BaseService.pushToErrorCallStack(null, function () {
                    //     _load(page, onSuccess, onError);
                    // }, WM.noop);
                }
                // showLoginDialog();
            } else if (sessionTimeoutMethod === LOGIN_METHOD.PAGE) {
                if (!page) {
                    page = this.getCurrentRoutePage();
                }
                this.routerService.navigate([sessionTimeoutConfig.pageName], {queryParams: {redirectTo: page}});
            }
        } else {
            // if no user found, 401 was thrown for first time login
            loginMethod = loginConfig.type.toUpperCase();
            switch (loginMethod) {
                case LOGIN_METHOD.DIALOG:
                    // Through loginDialog, user will remain in the current state and failed calls will be executed post login through LoginVariableService.
                    // NOTE: user will be redirected to respective landing page only if dialog is opened manually(not through a failed 401 call).
                    // $rs._noRedirect = true;
                    if (page) {
                        // BaseService.pushToErrorCallStack(null, function () {
                        //     _load(page, onSuccess, onError);
                        // }, WM.noop);
                    }
                    // showLoginDialog();
                    break;
                case LOGIN_METHOD.PAGE:
                    // do not provide redirectTo page if fetching HOME page resulted 401
                    // on app load, by default Home page is loaded
                    page = this.getRedirectPage(config);
                    this.routerService.navigate([loginConfig.pageName], {queryParams: {redirectTo: page}});
                    break;
                case LOGIN_METHOD.SSO:
                    // do not provide redirectTo page if fetching HOME page resulted 401
                    // on app load, by default Home page is loaded
                    page = this.getRedirectPage(config);
                    page = page ? '?redirectPage=' + encodeURIComponent(page) : '';
                    // pageParams = this.getQueryString($location.search());
                    pageParams = pageParams ? '?' + encodeURIComponent(pageParams) : '';
                    // showing a redirecting message
                    document.body.textContent = 'Redirecting to sso login...';
                    // appending redirect to page and page params
                    // ssoUrl = $rs.project.deployedUrl + SSO_URL + page + pageParams;
                    // /*
                    //  * remove iFrame when redirected to IdP login page.
                    //  * this is being done as IDPs do not allow to get themselves loaded into iFrames.
                    //  * remove-toolbar has been assigned with a window name WM_PREVIEW_WINDOW, check if the iframe is our toolbar related and
                    //  * safely change the location of the parent toolbar with current url.
                    //  */
                    // if ($window.self !== $window.top && $window.parent.name === PREVIEW_WINDOW_NAME) {
                    //     $window.parent.location.href = $window.self.location.href;
                    //     $window.parent.name = '';
                    // } else {
                    //     $window.location.href = ssoUrl;
                    // }
                    break;
            }
        }
    }
}
