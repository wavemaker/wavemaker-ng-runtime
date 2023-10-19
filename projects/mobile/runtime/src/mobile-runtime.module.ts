import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { Calendar } from '@awesome-cordova-plugins/calendar/ngx';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';

import { CookieService } from './services/cookie.service';

import {
    App,
    AbstractHttpService,
    hasCordova,
    insertAfter,
    isIpad,
    isIphone,
    isIpod,
    isObject,
    loadScript,
    loadStyleSheet,
    noop,
    removeNode,
    getWmProjectProperties
} from '@wm/core';
import { FileExtensionFromMimePipe } from '@wm/components/base';
import { DeviceFileOpenerService, DeviceService, ExtAppMessageService, MobileCoreModule, NetworkService } from '@wm/mobile/core';
import {OfflineModule, PushService, PushServiceImpl} from '@wm/mobile/offline';
import { SecurityService } from '@wm/security';
import { VariablesModule } from '@wm/mobile/variables';
import { $rootScope, CONSTANTS } from '@wm/variables';
import { BasicModule } from '@wm/mobile/components/basic';

import { AppExtComponent } from './components/app-ext.component';
import { MobileHttpInterceptor } from './services/http-interceptor.service';
import { WebProcessService } from './services/webprocess.service';
import {SearchModule} from "@wm/mobile/components/basic/search";
import {SegmentedControlModule} from "@wm/mobile/components/containers/segmented-control";
import {MediaListModule} from "@wm/mobile/components/data/media-list";
import {BarcodeScannerModule} from "@wm/mobile/components/device/barcode-scanner";
import {CameraModule} from "@wm/mobile/components/device/camera";
import {FileUploadModule} from "@wm/mobile/components/input/file-upload";
import {PageModule} from "@wm/mobile/components/page";
import {LeftPanelModule} from "@wm/mobile/components/page/left-panel";
import {MobileNavbarModule} from "@wm/mobile/components/page/mobile-navbar";
import {TabBarModule} from "@wm/mobile/components/page/tab-bar";

declare const $, navigator, _, cordova;

export const MAX_WAIT_TIME_4_OAUTH_MESSAGE = 60000;

const MINIMUM_TAB_WIDTH = 768;
const KEYBOARD_CLASS = 'keyboard';

const cordovaServices = [
    AppVersion,
    BarcodeScanner,
    Calendar,
    Camera,
    File,
    FileOpener,
    Device,
    Geolocation,
    MediaCapture,
    Network,
    SQLite,
    Vibration,
    LocationAccuracy,
    Diagnostic
];

export const MOBILE_COMPONENT_MODULES = [
    BasicModule,
    MobileCoreModule,
    OfflineModule,
    VariablesModule,
    SearchModule,
    SegmentedControlModule,
    MediaListModule,
    BarcodeScannerModule,
    CameraModule,
    FileUploadModule,
    PageModule,
    LeftPanelModule,
    MobileNavbarModule,
    TabBarModule
];

@NgModule({
    declarations: [
        AppExtComponent
    ],
    exports: [
        AppExtComponent,
        ...MOBILE_COMPONENT_MODULES
    ],
    imports: [
        MobileCoreModule,
        VariablesModule,
        BasicModule,
        ...MOBILE_COMPONENT_MODULES
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
                ...cordovaServices,
                FileExtensionFromMimePipe,
                {provide: PushService, useClass: PushServiceImpl}
            ]
        };
    }

    private static initialized = false;
    // Startup services have to be added only once in the app life-cycle.
    private static initializeRuntime(runtimeModule: MobileRuntimeModule,
                      app: App,
                      deviceFileOpenerService: DeviceFileOpenerService,
                      deviceService: DeviceService) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        app.deployedUrl = runtimeModule.getDeployedUrl();
        if (hasCordova()) {
            const unsubscribe = app.subscribe('pageReady', (page) => {
                navigator.splashscreen.hide();
                unsubscribe();
            });
            app.subscribe('userLoggedIn', () => {
                cordova && cordova.wavemaker.syncCookies();
            });
            runtimeModule.handleKeyBoardClass();
            app.subscribe('device-file-download', (data) => {
                deviceFileOpenerService.openRemoteFile(data.url, data.extension, data.name, data.headers).then(data.successCb, data.errorCb);
            });
            const __zone_symbol__FileReader = window['__zone_symbol__FileReader'];
            if (__zone_symbol__FileReader && __zone_symbol__FileReader.READ_CHUNK_SIZE) {
                // cordova File Reader is required. Otherwise, file operations are failing.
                window['FileReader'] = __zone_symbol__FileReader;
            }
            window.open = window['cordova']['InAppBrowser']['open'];
            runtimeModule.addAuthInBrowser();
        }
        deviceService.start();
        deviceService.whenReady().then(() => {
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
        this._$appEl = $('.wm-app').first();
        if (this._$appEl.width() >= MINIMUM_TAB_WIDTH) {
            app.isTabletApplicationType =  true;
            this._$appEl.addClass('wm-tablet-app');
        } else {
            this._$appEl.addClass('wm-mobile-app');
        }
        // applying os theme on getting os details
        app.subscribe('on-viewport-details', os => {
            this.applyOSTheme(os);
        });
        MobileRuntimeModule.initializeRuntime(this, this.app, this.deviceFileOpenerService, this.deviceService);
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

    public applyOSTheme(os) {
        let oldStyleSheet = $('link[theme="wmtheme"][href ^="themes"][href $="/style.css"]').first();
        if (oldStyleSheet.length) {
            const themeUrl = oldStyleSheet.attr('href').replace(new RegExp('/[a-z]*/style.css$'), `/${os.toLowerCase()}/style.css`),
                newStyleSheet = loadStyleSheet(themeUrl, {name: 'theme', value: 'wmtheme'});
            oldStyleSheet = oldStyleSheet.length > 0 && oldStyleSheet[0];
            if (newStyleSheet && oldStyleSheet) {
                insertAfter(newStyleSheet, oldStyleSheet);
                removeNode(oldStyleSheet);
            }
        }

        // In angular development, styleSheet will point to .js files
        // In angular production, styleSheet will point to 'wm-android-styles.css' or 'wm-ios-styles.css'
        const removeTheme = os.toLowerCase() === 'android' ? 'wm-ios-styles' : 'wm-android-styles';
        let isDevBuild;
        const useTheme = 'wm-' + os.toLowerCase() + '-styles';
        let unusedStyleSheet = $('link[href *=' + removeTheme + ']').first();
        if (!unusedStyleSheet.length) {
            isDevBuild = true;
            unusedStyleSheet = $('script[src *=' + removeTheme + ']').first();
        }
        if (unusedStyleSheet.length) {
            let newStyleSheet;
            if (isDevBuild) {
                newStyleSheet = unusedStyleSheet.clone();
                newStyleSheet = newStyleSheet[0];
                newStyleSheet.src = newStyleSheet.src.replace(removeTheme, useTheme);
                loadScript(newStyleSheet.src, false);
                unusedStyleSheet = unusedStyleSheet[0];
                insertAfter(newStyleSheet, unusedStyleSheet);
                removeNode(unusedStyleSheet);
            } else {
                newStyleSheet = $('link[href *=' + useTheme + ']').first();
                newStyleSheet = newStyleSheet[0];
                loadStyleSheet(newStyleSheet.href, {name: 'theme', value: 'wmtheme'});
                removeNode(unusedStyleSheet[0]);
            }
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
        let deployedUrl = $rootScope.project.deployedUrl;
        if (hasCordova()) {
            const baseUrl = $('meta[name="liveSync.deployedUrl"]').attr('value');
            const config = this.deviceService.getConfig();
            if (baseUrl) {
                deployedUrl = baseUrl;
            } else {
                deployedUrl = this.deviceService.getBaseUrl();
            }
            this.app.customUrlScheme = config.customUrlScheme;
        }
        if (deployedUrl !== 'NONE' && !deployedUrl.endsWith('/')) {
            deployedUrl = deployedUrl + '/';
        }
        $rootScope.project.deployedUrl = deployedUrl;
        return deployedUrl;
    }

    private addAuthInBrowser() {
        let isAuthenticating = false;
        this.securityService.authInBrowser = (): Promise<any> => {
            if (!this.networkService.isConnected()) {
                return Promise.reject('In offline, app cannot contact the server.');
            }
            if (isAuthenticating) {
                return Promise.reject('Authentication is in process.');
            }
            isAuthenticating = true;
            return this.webProcessService.execute('LOGIN', '/', true)
                .then(output => {
                    output = JSON.parse(output && output.replace(/&quot;/g, "\""));
                    if (output[CONSTANTS.XSRF_COOKIE_NAME]) {
                        localStorage.setItem(CONSTANTS.XSRF_COOKIE_NAME, output[CONSTANTS.XSRF_COOKIE_NAME]);
                    }
                    isAuthenticating = false;
                    return this.cookieService.clearAll()
                        .then(() => {
                            const  promises = _.keys(output).map(k => {
                                return this.cookieService.setCookie(this.app.deployedUrl, k, output[k]);
                            });
                            return Promise.all(promises);
                        });
                })
                .then(() => this.app.notify('userLoggedIn', {}))
                .catch((e) => {
                    isAuthenticating = false;
                    return Promise.reject(e);
                });
        };
    }
}
