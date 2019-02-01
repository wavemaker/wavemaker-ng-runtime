import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';

import {
    App,
    AbstractHttpService,
    fetchContent,
    getWmProjectProperties,
    hasCordova,
    insertAfter,
    isIpad,
    isIphone,
    isIpod,
    isObject,
    loadStyleSheet,
    noop,
    removeNode
} from '@wm/core';
import { WmMobileComponentsModule } from '@wm/mobile/components';
import { DeviceFileOpenerService, DeviceService, ExtAppMessageService, MobileCoreModule, NetworkService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';
import { VariablesModule } from '@wm/mobile/variables';
import { $rootScope, CONSTANTS } from '@wm/variables';

import { AppExtComponent } from './components/app-ext.component';
import { CookieService } from './services/cookie.service';
import { MobileHttpInterceptor } from './services/http-interceptor.service';
import { WebProcessService } from './services/webprocess.service';

declare const $, navigator, _;

export const MAX_WAIT_TIME_4_OAUTH_MESSAGE = 60000;

enum OS {
    IOS = 'ios',
    ANDROID = 'android'
}

const KEYBOARD_CLASS = 'keyboard';

@NgModule({
    declarations: [
        AppExtComponent
    ],
    exports: [
        AppExtComponent,
        WmMobileComponentsModule
    ],
    imports: [
        MobileCoreModule,
        VariablesModule,
        WmMobileComponentsModule
    ],
    providers: [
        WebProcessService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MobileHttpInterceptor,
            multi: true
        }
    ],
    bootstrap: []
})
export class MobileRuntimeModule {

    private _$appEl;

    constructor(
        private app: App,
        private cookieService: CookieService,
        private deviceFileOpenerService: DeviceFileOpenerService,
        private deviceService: DeviceService,
        private securityService: SecurityService,
        private httpService: AbstractHttpService,
        private extAppMessageService: ExtAppMessageService,
        private networkService: NetworkService,
        private webProcessService: WebProcessService
    ) {
        this._$appEl = $('.wm-app:first');
        this._$appEl.addClass('wm-mobile-app');
        app.deployedUrl = this.getDeployedUrl();
        this.getDeviceOS().then(os => {
            app.selectedViewPort = {
                os: os
            };
            this.applyOSTheme(os);
        });
        if (hasCordova()) {
            this.handleKeyBoardClass();
            deviceService.addStartUpService(cookieService);
            app.subscribe('userLoggedIn', () => {
                let url = $rootScope.project.deployedUrl;
                if (url.endsWith('/')) {
                    url = url.substr(0, url.length - 1);
                }
                cookieService.persistCookie(url, 'JSESSIONID').catch(noop);
                cookieService.persistCookie(url, 'SPRING_SECURITY_REMEMBER_ME_COOKIE').catch(noop);
            });
            app.subscribe('device-file-download', (data) => {
                deviceFileOpenerService.openRemoteFile(data.url, data.extension, data.name).then(data.successCb, data.errorCb);
            });
            const __zone_symbol__FileReader = window['__zone_symbol__FileReader'];
            if (__zone_symbol__FileReader && __zone_symbol__FileReader.READ_CHUNK_SIZE) {
                // cordova File Reader is required. Otherwise, file operations are failing.
                window['FileReader'] = __zone_symbol__FileReader;
            }
            if (!CONSTANTS.isWaveLens) {
                (window as any).remoteSync = (flag = true) => {
                    localStorage.setItem('remoteSync', flag ? 'true' : 'false');
                };
            }
            this.addAuthInBrowser();
        }
        deviceService.start();
        deviceService.whenReady().then(() => {
            if (hasCordova()) {
                this._$appEl.addClass('cordova');
                this.exposeOAuthService();
                navigator.splashscreen.hide();
            }
        });
    }

    private exposeOAuthService() {
        window['OAuthInMobile'] = (providerId) => {
            return new Promise<string>((resolve, reject) => {
                const oauthAdress = '^services/oauth/' + providerId + '$';
                const deregister = this.extAppMessageService.subscribe(oauthAdress, message => {
                        resolve(message.data['access_token']);
                        deregister();
                        clearTimeout(timerId);
                    });
                const timerId = setTimeout(function () {
                    deregister();
                    reject(`Time out for oauth message after ${MAX_WAIT_TIME_4_OAUTH_MESSAGE % 1000} seconds`);
                }, MAX_WAIT_TIME_4_OAUTH_MESSAGE);
            });
        };
        const handleOpenURL = window['handleOpenURL'];
        handleOpenURL.isReady = true;
        handleOpenURL(handleOpenURL.lastURL);
    }

    private applyOSTheme(os) {
        const themeUrl = `themes/${getWmProjectProperties().activeTheme}/${os.toLowerCase()}/style.css`,
            newStyleSheet = loadStyleSheet(themeUrl, {name: 'theme', value: 'wmtheme'});
        let oldStyleSheet = $('link[theme="wmtheme"]:first');
        oldStyleSheet = oldStyleSheet.length > 0 && oldStyleSheet[0];
        if (newStyleSheet && oldStyleSheet) {
            insertAfter(newStyleSheet, oldStyleSheet);
            removeNode(oldStyleSheet);
        }
    }

    private handleKeyBoardClass() {
        const initialScreenSize = window.innerHeight;
        // keyboard class is added when keyboard is open.
        window.addEventListener('resize', () => {
            if (window.innerHeight < initialScreenSize) {
                this._$appEl.addClass(KEYBOARD_CLASS);
            } else {
                this._$appEl.removeClass(KEYBOARD_CLASS);
            }
        });
    }

    private getDeployedUrl(): string {
        const waveLensAppUrl = window['WaveLens'] && window['WaveLens']['appUrl'];
        let deployedUrl = $rootScope.project.deployedUrl;
        if (hasCordova()) {
            if (waveLensAppUrl) {
                // TODO: Temporary Fix for WMS-13072, baseUrl is {{DEVELOPMENT_URL}} in wavelens
                deployedUrl = waveLensAppUrl;
            } else {
                fetchContent('json', './config.json', true, (response => {
                    if (!response.error && response.baseUrl) {
                        deployedUrl = response.baseUrl;
                    }
                }));
            }
        }
        if (!deployedUrl.endsWith('/')) {
            deployedUrl = deployedUrl + '/';
        }
        $rootScope.project.deployedUrl = deployedUrl;
        return deployedUrl;
    }

    private getDeviceOS(): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            const msgContent = {key: 'on-load'};
            // Notify preview window that application is ready. Otherwise, identify the OS.
            if (window.top !== window) {
                window.top.postMessage(msgContent, '*');
                // This is for preview page
                window.onmessage = function (msg) {
                    const data = msg.data;
                    if (isObject(data) && data.key === 'switch-device') {
                        resolve(data.device.os);
                    }
                };
            } else if (isIphone() || isIpod() || isIpad()) {
                resolve(OS.IOS);
            } else {
                resolve(OS.ANDROID);
            }
        });
    }

    private addAuthInBrowser() {
        this.securityService.authInBrowser = (): Promise<any> => {
            if (!this.networkService.isConnected()) {
                return Promise.reject('In offline, app cannot contact the server.');
            }
            return this.webProcessService.execute('LOGIN', '/')
                .then(output => {
                    let url = this.app.deployedUrl;
                    if (url.endsWith('/')) {
                        url = url.substr(0, url.length - 1);
                    }
                    output = JSON.parse(output);
                    if (output[CONSTANTS.XSRF_COOKIE_NAME]) {
                        localStorage.setItem(CONSTANTS.XSRF_COOKIE_NAME, output[CONSTANTS.XSRF_COOKIE_NAME]);
                    }
                    return this.cookieService.clearAll()
                        .then(() => {
                            const  promises = _.keys(output).map(k => {
                                return this.cookieService.setCookie(url, k, output[k]);
                            });
                            return Promise.all(promises);
                        });
                })
                .then(() => this.app.notify('userLoggedIn', {}));
        };
    }
}
