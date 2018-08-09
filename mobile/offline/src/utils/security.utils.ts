
import { File } from '@ionic-native/file';

import { App, noop, triggerFn} from '@wm/core';
import { NetworkService, DeviceService } from '@wm/mobile/core';
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
        private deviceService: DeviceService,
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
        const origLoad = this.securityService.load;
        const origAppLogout = this.securityService.appLogout;
        /**
         * Add offline behaviour to SecurityService.getConfig. When offline, this funcation returns security
         * config of last logged-in user will be returned, provided the user did not logout last time.
         *
         * @param successCallback
         * @param failureCallback
         */
        this.securityService.load = () => {
            return new Promise((resolve, reject) => {
                if (this.networkService.isConnected()) {
                    origLoad.call(this.securityService).then(config => {
                        this.securityConfig = config;
                        this.saveSecurityConfigLocally(config);
                        resolve(this.securityConfig);
                    }, reject);
                } else {
                    this.readLocalSecurityConfig().then(config => {
                        if (config.loggedOut) {
                            return origLoad.call(this.securityService);
                        } else {
                            this.securityConfig = config;
                            this.securityService.config = config;
                            return config;
                        }
                    }, () => origLoad.call(this.securityConfig)).then(resolve, reject);
                }
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
        this.deviceService.whenReady().then(() => this.clearLastLoggedInUser());
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
        return this.file.readAsText(cordova.file.dataDirectory, SECURITY_FILE).then(JSON.parse, noop);
    }
}