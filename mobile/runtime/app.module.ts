import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';


import { App, fetchContent, hasCordova, insertAfter, isIpad, isIphone, isIpod, isObject, loadStyleSheet, removeNode } from '@wm/core';
import { NetworkInfoToasterComponent, WmMobileComponentsModule } from '@wm/mobile/components';
import { MobileCoreModule, DeviceService } from '@wm/mobile/core';
import { VariablesModule } from '@wm/mobile/variables';
import { $rootScope } from '@wm/variables';

import {MobileHttpInterceptor} from './services/http-interceptor.service';

declare const $, navigator;
declare const _WM_APP_PROPERTIES;

enum OS {
    IOS = 'ios',
    ANDROID = 'android'
}

const KEYBOARD_CLASS = 'keyboard';

@NgModule({
    declarations: [],
    imports: [
        MobileCoreModule,
        VariablesModule,
        WmMobileComponentsModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MobileHttpInterceptor,
            multi: true
        }
    ],
    bootstrap: [NetworkInfoToasterComponent]
})
export class MobileAppModule {

    private _$appEl;

    constructor(app: App, deviceService: DeviceService) {
        this._$appEl = $('.wm-app:first');
        this._$appEl.addClass('wm-mobile-app');
        if (hasCordova()) {
            this._$appEl.addClass('cordova');
            navigator.splashscreen.hide();
        }
        app.deployedUrl = this.getDeployedUrl();
        this.getDeviceOS().then(os => this.applyOSTheme(os));
        this.handleKeyBoardClass();
        deviceService.start();
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
            $rootScope.project.deployedUrl = deployedUrl;
        }
        if (!deployedUrl.endsWith('/')) {
            deployedUrl = deployedUrl + '/';
        }
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
