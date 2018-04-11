import { getValidJSON, triggerFn } from '@wm/utils';

import { BaseActionManager } from './base-action.manager';
import { $rootScope, CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { initiateCallback, securityService } from './../../util/variable/variables.utils';

export class LogoutActionManager extends BaseActionManager {
    logout(variable, options, success, error) {
        const variableEvents = VARIABLE_CONSTANTS.EVENTS;
        let handleError,
            redirectPage,
            output;

        handleError = function (msg, details, xhrObj) {
            /* if in RUN mode, trigger error events associated with the variable */
            if (!CONSTANTS.isStudioMode) {
                initiateCallback('onError', variable, msg, xhrObj);
            }
            triggerFn(error, msg, xhrObj);
        };

        // $rootScope.$emit('toggle-variable-state', variable, true);
        // EVENT: ON_BEFORE_UPDATE
        output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, null);
        if (output === false) {
            triggerFn(error);
            return;
        }
        securityService.isAuthenticated(function (isAuthenticated) {
            // $rootScope.$emit('toggle-variable-state', variable, false);
            if (isAuthenticated) {
                variable.promise = securityService.appLogout(function (redirectUrl) {
                    // Reset Security Config.
                    // $rootScope.isUserAuthenticated = false;
                    securityService.resetSecurityConfig().
                    then(function () {
                        // EVENT: ON_RESULT
                        initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, redirectUrl);
                        // EVENT: ON_SUCCESS
                        initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, redirectUrl);
                    });

                    // In case of CAS response will be the redirectUrl
                    redirectUrl = getValidJSON(redirectUrl);
                    if (redirectUrl) {
                        window.location.href = redirectUrl.result;
                    } else if (variable.useDefaultSuccessHandler) {
                        redirectPage = variable.redirectTo;
                        /* backward compatibility (index.html/login.html may be present in older projects) */
                        if (!redirectPage || redirectPage === 'login.html' || redirectPage === 'index.html') {
                            redirectPage = '';
                        }
                        // $location.url(redirectPage);
                        setTimeout(function () {
                            // reloading in timeout as, firefox and safari are not updating the url before reload(WMS-7887)
                            window.location.reload();
                        });
                    }
                    triggerFn(success);
                }, handleError);
            } else {
                handleError('No authenticated user to logout.');
            }
        }, function (err) {
            // $rootScope.$emit('toggle-variable-state', variable, false);
            handleError(err);
        });
    }
}