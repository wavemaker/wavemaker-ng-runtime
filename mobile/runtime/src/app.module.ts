import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';


import { App, fetchContent, hasCordova, insertAfter, isIpad, isIphone, isIpod, isObject, loadStyleSheet, removeNode } from '@wm/core';
import { WmMobileComponentsModule } from '@wm/mobile/components';
import { MobileCoreModule, DeviceService, ExtAppMessageService } from '@wm/mobile/core';
import { OfflineModule } from '@wm/mobile/offline';
import { VariablesModule } from '@wm/mobile/variables';
import { $rootScope } from '@wm/variables';

import { CookieService } from './services/cookie.service';
import { MobileHttpInterceptor } from './services/http-interceptor.service';
import { AppExtComponent } from './app-ext.component';

declare const $, navigator;
declare const _WM_APP_PROPERTIES;

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
        AppExtComponent
    ],
    imports: [
        MobileCoreModule,
        VariablesModule,
        WmMobileComponentsModule
    ],
    providers: [
        CookieService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MobileHttpInterceptor,
            multi: true
        }
    ],
    bootstrap: []
})
export class MobileAppModule {

    private _$appEl;

    constructor(app: App, cookieService: CookieService, deviceService: DeviceService, private extAppMessageService: ExtAppMessageService) {
        this._$appEl = $('.wm-app:first');
        this._$appEl.addClass('wm-mobile-app');
        app.deployedUrl = this.getDeployedUrl();
        this.getDeviceOS().then(os => this.applyOSTheme(os));
        if (hasCordova()) {
            this.handleKeyBoardClass();
            deviceService.addStartUpService(cookieService);
        }
        deviceService.start();
        deviceService.whenReady().then(() => {
            if (hasCordova()) {
                this._$appEl.addClass('cordova');
                this.exposeOAuthService();
                navigator.splashscreen.hide();
            }
        });
        app.subscribe('userLoggedIn', () => {
            cookieService.persistCookie($rootScope.project.deployedUrl, 'JSESSIONID');
            cookieService.persistCookie($rootScope.project.deployedUrl, 'SPRING_SECURITY_REMEMBER_ME_COOKIE');
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
        const themeUrl = `themes/${_WM_APP_PROPERTIES.activeTheme}/${os.toLowerCase()}/style.css`,
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
}
