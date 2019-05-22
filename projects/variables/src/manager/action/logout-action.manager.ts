import { getValidJSON, triggerFn } from '@wm/core';

import { BaseActionManager } from './base-action.manager';
import { CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { appManager, initiateCallback, securityService } from './../../util/variable/variables.utils';
import { routerService } from '../../util/variable/variables.utils';

export class LogoutActionManager extends BaseActionManager {
    logout(variable, options, success, error) {
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

        // EVENT: ON_BEFORE_UPDATE
        output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, null);
        if (output === false) {
            triggerFn(error);
            return;
        }
        securityService.isAuthenticated(isAuthenticated => {
            if (isAuthenticated) {
                this.notifyInflight(variable, true);
                variable.promise = securityService.appLogout(response => {
                    let redirectUrl = response.body;
                    redirectUrl = getValidJSON(redirectUrl);
                    // Reset Security Config.
                    // $rootScope.isUserAuthenticated = false;
                    appManager.reloadAppData().
                    then(() => {
                        this.notifyInflight(variable, false, redirectUrl);
                        // EVENT: ON_RESULT
                        initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, redirectUrl);
                        // EVENT: ON_SUCCESS
                        initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, redirectUrl);
                    });

                    // In case of CAS response will be the redirectUrl
                    if (redirectUrl && redirectUrl.result) {
                        window.location.href = redirectUrl.result;
                    } else if (variable.useDefaultSuccessHandler) {
                        redirectPage = variable.redirectTo;
                        /* backward compatibility (index.html/login.html may be present in older projects) */
                        if (!redirectPage || redirectPage === 'login.html' || redirectPage === 'index.html') {
                            redirectPage = '';
                        }
                        routerService.navigate([`/${redirectPage}`]);
                        // do not reload the mobile app.
                        if (!window['cordova']) {
                            setTimeout(() => {
                                // reloading in timeout as, firefox and safari are not updating the url before reload(WMS-7887)
                                window.location.reload();
                            });
                        }
                    }
                    triggerFn(success);
                }, handleError);
            } else {
                handleError('No authenticated user to logout.');
            }
        }, (err) => {
            this.notifyInflight(variable, false, err);
            handleError(err);
        });
    }
}
