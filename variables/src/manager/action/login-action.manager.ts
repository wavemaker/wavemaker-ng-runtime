declare const _;
import { BaseActionManager } from './base-action.manager';
import { initiateCallback, routerService, securityService } from '../../util/variable/variables.utils';
import { triggerFn } from '@wm/utils';
import { CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';

export class LoginActionManager extends BaseActionManager {
    login(variable, options, success, error) {
        options = options || {};
        console.log('logging in now..');
        let params: any = {},
            errMsg,
            paramKey,
            output,
            loginInfo = {};

        /* If login info provided along explicitly with options, don't look into the variable bindings for the same */
        if (options.loginInfo) {
            loginInfo = options.loginInfo;
        } else {
            loginInfo = variable.dataBinding;
        }

        for (paramKey in loginInfo) {
            // TODO[VIBHU]: check if this logic is required
            if (loginInfo.hasOwnProperty(paramKey) &&
                (loginInfo[paramKey] === '' || loginInfo[paramKey] === undefined) &&
                paramKey !== "rememberme") {
                errMsg = "Please provide " + paramKey + ".";
                break;
            }
            params[paramKey] = loginInfo[paramKey];
        }

        /* if error message initialized, return error */
        if (errMsg) {
            /* if in RUN mode, trigger error events associated with the variable */
            if (CONSTANTS.isRunMode) {
                triggerFn(error, errMsg);
                initiateCallback("onError", variable, errMsg);
            }
            return;
        }

        //Triggering 'onBeforeUpdate' and considering
        output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, params);
        if (_.isObject(output)) {
            params = output;
        } else if (output === false) {
            triggerFn(error);
            return;
        }
        // $rootScope.$emit('toggle-variable-state', variable, true);

        variable.promise = securityService.appLogin(params).then(function (response) {
            // $rootScope.$emit('toggle-variable-state', variable, false);
            var redirectUrl = response && response.url ? response.url : 'index.html',
                // appManager = Utils.getService("AppManager"),
                lastLoggedinUser = securityService.getLastLoggedInUser();
            //Closing login dialog after successful login
            // DialogService.close('CommonLoginDialog');
            if (!CONSTANTS.isRunMode) {
                return;
            }
            /*
             * Get fresh security config
             * Get App variables. if not loaded
             * Update loggedInUser variable with new user details
             */
            securityService.resetSecurityConfig().
            then(function (config) {
                triggerFn(success);

                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, _.get(config, 'userInfo'));

                // get redirectTo page from URL and remove it from URL
                var redirectPage = this.securityService.getCurrentRouteQueryParam('redirectTo');

                /* handle navigation if defaultSuccessHandler on variable is true */
                if (variable.useDefaultSuccessHandler) {
                    // if first time user logging in or same user re-logging in, execute n/w calls failed before logging in
                    // if (!lastLoggedinUser || lastLoggedinUser === params.username) {
                    //     BaseService.executeErrorCallStack();
                    // }

                    if (CONSTANTS.hasCordova && _.includes(redirectUrl, '/')) {
                        /*
                         * when the application is running as a mobile application,
                         * use the local app files instead of server files.
                         */
                        redirectUrl = redirectUrl.substr(redirectUrl.lastIndexOf('/') + 1);
                    }
                    // if redirectPage found in url, case of re-login on session timeout
                    if (redirectPage && _.isString(redirectPage)) {
                        if (!lastLoggedinUser || lastLoggedinUser === params.username) {
                            // if first time login OR same user re-logging in, navigate to provided redirectPage
                            routerService.navigate([`/${redirectPage}`]);
                        } else {
                            // else, re-load the app, navigation will be taken care in wmbootstrap.js
                            routerService.reload();
                        }
                    } else if (options.mode === 'dialog' && lastLoggedinUser !== params.username) {
                        /* else, re-load the app, navigation will be taken care in wmbootstrap.js' */
                        routerService.reload();
                    } else if (options.mode !== 'dialog') {
                        securityService.navigateOnLogin();
                    }
                }
            });
        }, function (errorMsg) {
            // $rootScope.$emit('toggle-variable-state', variable, false);
            errorMsg = errorMsg || "Invalid credentials.";
            /* if in RUN mode, trigger error events associated with the variable */
            if (CONSTANTS.isRunMode) {
                initiateCallback("onError", variable, errorMsg);
            }
            triggerFn(error, errorMsg);
        });
    }
}