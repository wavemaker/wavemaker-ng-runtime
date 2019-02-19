import { File } from '@ionic-native/file';

import { App, noop, triggerFn } from '@wm/core';
import { DeviceService, NetworkService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';

declare const _;
declare const cordova;
const SECURITY_FILE = 'logged-in-user.info';
declare const resolveLocalFileSystemURL;

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
                    this.readLocalSecurityConfig().then((config = {}) => {
                        this.securityConfig = config;
                        this.securityService.config = config;
                        return config;
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
                authenticated: false,
                loggedOut: true,
                securityEnabled: this.securityConfig && this.securityConfig.securityEnabled,
                loggedOutOffline: !this.networkService.isConnected(),
                loginConfig: this.securityConfig && this.securityConfig.loginConfig,
                userInfo: null
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
            if (config && config.loggedOutOffline) {
                this.securityService.appLogout(null, null);
            } else if (!this.networkService.isConnected()) {
                this.securityConfig = config || {};
            }
        });
    }

    private readLocalSecurityConfig(): Promise<any> {
        // reading the security info from file in dataDirectory but when this file is not available then fetching the config from the app directory
        return new Promise((resolve, reject) => {
            const rootDir = cordova.file.dataDirectory;
            this.file.checkFile(rootDir, SECURITY_FILE).then(() => {
                return this.readFileAsTxt(rootDir, SECURITY_FILE).then(resolve, reject);
            }, () => {
                const folderPath = cordova.file.applicationDirectory + 'www/metadata/app',
                    fileName = 'security-config.json';
                return this.readFileAsTxt(folderPath, fileName).then(resolve, reject);
            });
        });
    }

    private readFileAsTxt(folderPath, fileName): Promise<any> {
        return this.file.readAsText(folderPath, fileName).then(JSON.parse).catch(noop);
    }
}
