declare const _;

import { triggerFn } from '@wm/core';

import { BaseActionManager } from './base-action.manager';
import { CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { initiateCallback, routerService, securityService, dialogService } from '../../util/variable/variables.utils';

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
                paramKey !== 'rememberme') {
                errMsg = 'Please provide ' + paramKey + '.';
                break;
            }
            params[paramKey] = loginInfo[paramKey];
        }

        /* if error message initialized, return error */
        if (errMsg) {
            /* if in RUN mode, trigger error events associated with the variable */
            if (CONSTANTS.isRunMode) {
                triggerFn(error, errMsg);
                initiateCallback('onError', variable, errMsg);
            }
            return;
        }

        // Triggering 'onBeforeUpdate' and considering
        output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, params);
        if (_.isObject(output)) {
            params = output;
        } else if (output === false) {
            triggerFn(error);
            return;
        }
        // $rootScope.$emit('toggle-variable-state', variable, true);

        // get previously loggedInUser name (if any)
        const lastLoggedInUsername = _.get(securityService.get(), 'userInfo.userName');
        variable.promise = securityService.appLogin(params, function (response) {
            // $rootScope.$emit('toggle-variable-state', variable, false);
            // Closing login dialog after successful login
            dialogService.close('CommonLoginDialog');

            /*
             * Get fresh security config
             * Get App variables. if not loaded
             * Update loggedInUser variable with new user details
             */
            securityService.resetSecurityConfig().
            then(function (config) {
                triggerFn(success);

                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, _.get(config, 'userInfo'));

                /* handle navigation if defaultSuccessHandler on variable is true */
                if (variable.useDefaultSuccessHandler) {
                    // if first time user logging in or same user re-logging in, execute n/w calls failed before logging in
                    if (!lastLoggedInUsername || lastLoggedInUsername === params.username) {
                        //BaseService.executeErrorCallStack();
                    }
                    // get redirectTo page from URL and remove it from URL
                    const redirectPage = securityService.getCurrentRouteQueryParam('redirectTo');

                    // first time login
                    if (!lastLoggedInUsername) {
                        // if redirect page found, navigate to it.
                        if (!_.isEmpty(redirectPage)) {
                            routerService.navigate([`/${redirectPage}`]);
                        } else {
                            // simply reset the URL, route handling will take care of page redirection
                            routerService.navigate([`/`]);
                        }
                    } else {
                    // login after a session timeout
                        // if redirect page found and same user logs in again, just navigate to redirect page
                        if (!_.isEmpty(redirectPage)) {
                            // same user logs in again, just redirect to the redirectPage
                            if (lastLoggedInUsername === params.username) {
                                routerService.navigate([`/${redirectPage}`]);
                            } else {
                                // different user logs in, reload the app and discard the redirectPage
                                routerService.navigate([`/`]);
                                window.location.reload();
                            }
                        } else {
                            const securityConfig = securityService.get(),
                                sessionTimeoutLoginMode = _.get(securityConfig, 'loginConfig.sessionTimeout.type') || 'PAGE';
                            // if in dialog mode and a new user logs in OR login happening through page, reload the app
                            if (lastLoggedInUsername !== params.username || sessionTimeoutLoginMode !== 'DIALOG') {
                                routerService.navigate([`/`]);
                                window.location.reload();
                            }
                        }

                    }
                }
            });
        }, function (errorMsg, errorDetails, xhrObj) {
            // $rootScope.$emit('toggle-variable-state', variable, false);
            errorMsg = errorMsg || 'Invalid credentials.';
            /* if in RUN mode, trigger error events associated with the variable */
            if (CONSTANTS.isRunMode) {
                initiateCallback('onError', variable, errorMsg, xhrObj);
            }
            triggerFn(error, errorMsg, xhrObj);
        });
    }
}