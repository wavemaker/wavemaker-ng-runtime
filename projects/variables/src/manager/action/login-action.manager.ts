import { getClonedObject, triggerFn } from '@wm/core';

import { BaseActionManager } from './base-action.manager';
import { CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { appManager, dialogService, initiateCallback, routerService, securityService } from '../../util/variable/variables.utils';

declare const _;

export class LoginActionManager extends BaseActionManager {

    private validate(params: any) {
        let err, paramKey, remembermeKey;
        const LOGIN_PARAM_REMEMBER_ME = 'j_rememberme';
        const LOGIN_PARAM_REMEMBER_ME_OLD = ['rememberme', 'remembermecheck'];

        // for older projects
        LOGIN_PARAM_REMEMBER_ME_OLD.forEach((old_key) => {
            if (_.isBoolean(params[old_key])) {
                remembermeKey = old_key;
            }
        });

        remembermeKey =  remembermeKey || LOGIN_PARAM_REMEMBER_ME;

        // check remember me
        params[remembermeKey] = _.isBoolean(params[remembermeKey]) ? params[remembermeKey] : false;

        for (paramKey in params) {
            if (params.hasOwnProperty(paramKey) &&
                (params[paramKey] === '' || params[paramKey] === undefined)) {
                err = 'Please provide required credentials';
                break;
            }
        }

        return err;
    }

    private migrateOldParams(params) {
        const loginParams = {},
            paramMigrationMap = {
            'usernametext': 'j_username',
            'username': 'j_username',
            'passwordtext': 'j_password',
            'password': 'j_password',
            'remembermecheck': 'j_rememberme',
            'rememberme': 'j_rememberme'
        };

        _.each(params, function(value, key) {
            if (paramMigrationMap[key]) {
                loginParams[paramMigrationMap[key]] = value;
            } else {
                loginParams[key] = value;
            }
        });
        return loginParams;
    }

    login(variable, options, success, error) {
        options = options || {};

        // If login info provided along explicitly with options, don't look into the variable bindings for the same
        const loginInfo: any = options.loginInfo || options.input || variable.dataBinding;

        // client side validation
        const errMsg = this.validate(loginInfo);

        /* if error message initialized, return error */
        if (errMsg) {
            triggerFn(error, errMsg);
            initiateCallback('onError', variable, errMsg);
            return;
        }

        // Triggering 'onBeforeUpdate' and considering
        let params: any = getClonedObject(loginInfo);
        const output: any = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, params);
        if (_.isObject(output)) {
            params = output;
        } else if (output === false) {
            triggerFn(error);
            return;
        }

        // migrate old params to new
        params = this.migrateOldParams(params);

        // get previously loggedInUser name (if any)
        const lastLoggedInUsername = _.get(securityService.get(), 'userInfo.userName');

        this.notifyInflight(variable, true);
        variable.promise = securityService.appLogin(params, (response) => {
            // Closing login dialog after successful login
            dialogService.close('CommonLoginDialog');

            /*
             * Get fresh security config
             * Get App variables. if not loaded
             * Update loggedInUser variable with new user details
             */
            appManager.reloadAppData().
            then((config) => {
                // hide the spinner after all the n/w calls are completed
                this.notifyInflight(variable, false, response);
                triggerFn(success);
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, _.get(config, 'userInfo'));

                /* handle navigation if defaultSuccessHandler on variable is true */
                if (variable.useDefaultSuccessHandler) {
                    const isSameUserReloggedIn = lastLoggedInUsername === params['j_username'];
                    // if first time user logging in or same user re-logging in, execute n/w calls failed before logging in
                    if (!lastLoggedInUsername || isSameUserReloggedIn) {
                        appManager.executeSessionFailureRequests();
                    }
                    // get redirectTo page from URL and remove it from URL
                    const redirectPage = securityService.getCurrentRouteQueryParam('redirectTo'),
                        noRedirect = appManager.noRedirect();

                    appManager.noRedirect(false);
                    // first time login
                    if (!lastLoggedInUsername) {
                        // if redirect page found, navigate to it.
                        if (!_.isEmpty(redirectPage)) {
                            routerService.navigate([`/${redirectPage}`]);
                        } else if (!noRedirect) {
                            // simply reset the URL, route handling will take care of page redirection
                            routerService.navigate([`/`]);
                        }
                    } else {
                    // login after a session timeout
                        // if redirect page found and same user logs in again, just navigate to redirect page
                        if (!_.isEmpty(redirectPage)) {
                            // same user logs in again, just redirect to the redirectPage
                            if (lastLoggedInUsername === params['j_username']) {
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
                            if (!isSameUserReloggedIn || sessionTimeoutLoginMode !== 'DIALOG') {
                                routerService.navigate([`/`]);
                                window.location.reload();
                            }
                        }

                    }
                }
            });
        }, (e) => {
            this.notifyInflight(variable, false, e);
            const errorMsg = e.error || 'Invalid credentials.';
            const xhrObj = e.details;
            /* if in RUN mode, trigger error events associated with the variable */
            if (CONSTANTS.isRunMode) {
                initiateCallback('onError', variable, errorMsg, xhrObj);
            }
            triggerFn(error, errorMsg, xhrObj);
        });
    }
}
