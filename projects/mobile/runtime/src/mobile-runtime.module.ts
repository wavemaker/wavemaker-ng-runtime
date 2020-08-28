import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { AppVersion } from '@ionic-native/app-version';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Calendar } from '@ionic-native/calendar';
import { Camera } from '@ionic-native/camera';
import { Contacts } from '@ionic-native/contacts';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { Device } from '@ionic-native/device';
import { MediaCapture } from '@ionic-native/media-capture';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { SQLite } from '@ionic-native/sqlite';
import { Vibration } from '@ionic-native/vibration';


import {
    App,
    AbstractHttpService,
    fetchContent,
    hasCordova,
    isSpotcues,
    insertAfter,
    isIpad,
    isIphone,
    isIpod,
    isObject,
    loadStyleSheet,
    noop,
    removeNode
} from '@wm/core';
import { FileExtensionFromMimePipe } from '@wm/components/base';
import { DeviceFileOpenerService, DeviceService, ExtAppMessageService, MobileCoreModule, NetworkService } from '@wm/mobile/core';
import { PushService, PushServiceImpl } from '@wm/mobile/offline';
import { SecurityService } from '@wm/security';
import { VariablesModule } from '@wm/mobile/variables';
import { $rootScope, CONSTANTS } from '@wm/variables';
import { BasicModule } from '@wm/mobile/components/basic';

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
const MINIMUM_TAB_WIDTH = 768;
const KEYBOARD_CLASS = 'keyboard';

const ionicServices = [
    AppVersion,
    BarcodeScanner,
    Calendar,
    Camera,
    Contacts,
    File,
    FileOpener,
    Device,
    Geolocation,
    MediaCapture,
    Network,
    SQLite,
    Vibration
];

@NgModule({
    declarations: [
        AppExtComponent
    ],
    exports: [
        AppExtComponent
    ],
    imports: [
        MobileCoreModule,
        VariablesModule,
        BasicModule
    ],
    bootstrap: []
})
export class MobileRuntimeModule {

    static forRoot(): ModuleWithProviders<MobileRuntimeModule> {
        /* add all providers that are required for mobile here. This is to simplify placeholder.*/
        return {
            ngModule: MobileRuntimeModule,
            providers: [
                WebProcessService,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: MobileHttpInterceptor,
                    multi: true
                },
                ...ionicServices,
                FileExtensionFromMimePipe,
                {provide: PushService, useClass: PushServiceImpl}
            ]
        };
    }

    private static initialized = false;
    // Startup services have to be added only once in the app life-cycle.
    private static initializeRuntime(runtimeModule: MobileRuntimeModule,
                      app: App,
                      cookieService: CookieService,
                      deviceFileOpenerService: DeviceFileOpenerService,
                      deviceService: DeviceService) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        app.deployedUrl = runtimeModule.getDeployedUrl();
        runtimeModule.getDeviceOS().then(os => {
            app.selectedViewPort = {
                os: os
            };
            runtimeModule.applyOSTheme(os);
        });
        if (hasCordova()) {
            const unsubscribe = app.subscribe('pageReady', (page) => {
                if (!isSpotcues) {
                    navigator.splashscreen.hide();
                }
                unsubscribe();
            });
            runtimeModule.handleKeyBoardClass();
            deviceService.addStartUpService(cookieService);
            if (!isSpotcues) {
                app.subscribe('userLoggedIn', () => {
                    let url = $rootScope.project.deployedUrl;
                    if (url.endsWith('/')) {
                        url = url.substr(0, url.length - 1);
                    }
                    cookieService.persistCookie(url, 'JSESSIONID').catch(noop);
                    cookieService.persistCookie(url, 'SPRING_SECURITY_REMEMBER_ME_COOKIE').catch(noop);
                });
            }
            app.subscribe('device-file-download', (data) => {
                deviceFileOpenerService.openRemoteFile(data.url, data.extension, data.name, data.headers).then(data.successCb, data.errorCb);
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
            runtimeModule.addAuthInBrowser();
        }
        deviceService.start();
        deviceService.whenReady().then(() => {
            // To make wavelens work with spotcues environment
            if (isSpotcues) {
                const params = location.search.substring(1)
                    .split('&')
                    .map(s => s.split('='))
                    .reduce((a, c, i, s) => {
                        a[s[i][0]] = s[i][1];
                        return a;
                    }, {});
                if (params && params['wavelens']) {
                    const $body = $('body:first');
                    $body.append(`<script src="${params['wavelens']}/runtime/script.js"></script>`);
                    $body.append(`<link rel="stylesheet" href="${params['wavelens']}/runtime/styles.css">`);
                }
            }
            if (hasCordova()) {
                runtimeModule._$appEl.addClass('cordova');
                runtimeModule.exposeOAuthService();
                // Fix for issue: ios device is not considering the background style, eventhough value is set in config.xml.
                if (window['StatusBar']) {
                    window['StatusBar'].overlaysWebView(false);
                }
            }
        });
    }

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
        if (this._$appEl.width() >= MINIMUM_TAB_WIDTH) {
            app.isTabletApplicationType =  true;
            this._$appEl.addClass('wm-tablet-app');
        } else {
            this._$appEl.addClass('wm-mobile-app');
        }
        MobileRuntimeModule.initializeRuntime(this, this.app, this.cookieService, this.deviceFileOpenerService, this.deviceService);
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
        let oldStyleSheet = $('link[theme="wmtheme"]:first');
        const themeUrl = oldStyleSheet.attr('href').replace(new RegExp('/[a-z]*/style.css$'), `/${os.toLowerCase()}/style.css`),
            newStyleSheet = loadStyleSheet(themeUrl, {name: 'theme', value: 'wmtheme'});
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
        if (hasCordova() && !isSpotcues) {
            if (waveLensAppUrl) {
                // TODO: Temporary Fix for WMS-13072, baseUrl is {{DEVELOPMENT_URL}} in wavelens
                deployedUrl = waveLensAppUrl;
            } else {
                fetchContent('json', './config.json', true, (response => {
                    if (!response.error && response.baseUrl) {
                        deployedUrl = response.baseUrl;
                        this.app.customUrlScheme = response.customUrlScheme;
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
