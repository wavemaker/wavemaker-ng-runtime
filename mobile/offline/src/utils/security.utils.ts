
import { File } from '@ionic-native/file';

import { App, noop, triggerFn } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';

declare const _;
declare const cordova;
const SECURITY_FILE = 'logged-in-user.info';

let isOfflineBehaviourAdded = false;

export class SecurityOfflineBehaviour {

    private saveSecurityConfigLocally;
    private securityConfig: any;

    constructor(
        private app: App,
        private file: File,
        private networkService: NetworkService,
        private securityService: SecurityService
    ) {
        this.saveSecurityConfigLocally = _.debounce((config: any) => {
            this._saveSecurityConfigLocally(config);
        }, 1000);
    }

    public add() {
        if (isOfflineBehaviourAdded) {
            return;
        }
        isOfflineBehaviourAdded = true;
        const origConfig = this.securityService.getConfig;
        const origAppLogout = this.securityService.appLogout;
        /**
         * Add offline behaviour to SecurityService.getConfig. When offline, this funcation returns security
         * config of last logged-in user will be returned, provided the user did not logout last time.
         *
         * @param successCallback
         * @param failureCallback
         */
        this.securityService.getConfig = (successCallback, failureCallback) => {
            if (this.networkService.isConnected()) {
                origConfig.call(this.securityService, config => {
                    this.securityConfig = config;
                    this.saveSecurityConfigLocally(config);
                    triggerFn(successCallback, config);
                }, failureCallback);
            } else {
                this.readLocalSecurityConfig().then(config => {
                    if (config.loggedOut) {
                        origConfig.call(this.securityService, successCallback, failureCallback);
                    } else {
                        this.securityConfig = config;
                        triggerFn(successCallback, this.securityConfig);
                    }
                }, () => origConfig.call(this.securityConfig, successCallback, failureCallback));
            }
        };

        this.securityService.load = () => {
            return new Promise<any>((resolve, reject) => {
                this.securityService.getConfig(resolve, reject);
            });
        };

        /**
         * When users logs out, local config will be removed. If the user is offline and logs out, then user
         * will be logged out from the app and cookies are invalidated when app goes online next time.
         *
         * @param successCallback
         * @param failureCallback
         */
        this.securityService.appLogout = (successCallback, failureCallback) => {
            this.securityConfig = {
                authenticated : false,
                loggedOut : true,
                loggedOutOffline : !this.networkService.isConnected()
            };
            this._saveSecurityConfigLocally(this.securityConfig).catch(noop).then(() => {
                if (this.networkService.isConnected()) {
                    origAppLogout.call(this.securityService, successCallback, failureCallback);
                } else {
                    location.assign(window.location.origin + window.location.pathname);
                }
            });
        };
        /**
         * @param successCallback
         */
        this.securityService.isAuthenticated = successCallback => {
            triggerFn(successCallback, this.securityConfig.authenticated === true);
        };
        this.clearLastLoggedInUser();
        /**
         * If the user has chosen to logout while app is offline, then invalidation of cookies happens when
         * app comes online next time.
         */
        this.app.subscribe('onNetworkStateChange', data => {
            if (data.isConnected) {
                this.clearLastLoggedInUser();
            }
        });
    }

    private _saveSecurityConfigLocally(config: any): Promise<any> {
        return this.file.writeFile(cordova.file.dataDirectory, SECURITY_FILE, JSON.stringify(config), { replace : true });
    }

    private clearLastLoggedInUser() {
        return this.readLocalSecurityConfig().then(config => {
            this.securityConfig = config || {};
            if (this.securityConfig.loggedOutOffline && this.networkService.isConnected()) {
                this.securityService.appLogout(null, null);
            }
        });
    }

    private readLocalSecurityConfig(): Promise<any> {
        return this.file.readAsText(cordova.file.dataDirectory, SECURITY_FILE).then(JSON.parse);
    }
}