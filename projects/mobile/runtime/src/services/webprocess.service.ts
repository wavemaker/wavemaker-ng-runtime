import { Injectable } from '@angular/core';

import { App, AbstractHttpService } from '@wm/core';
import { ExtAppMessageService } from '@wm/mobile/core';

import { CookieService } from './cookie.service';

declare const cordova;

@Injectable()
export class WebProcessService {

    constructor(
        private app: App,
        private cookieService: CookieService,
        private httpService: AbstractHttpService,
        private extAppMessageService: ExtAppMessageService
    ) {}

    public execute(process: string, hookUrl: string, useSystemBrowser = false): Promise<any> {
        return this.httpService.get(`/services/webprocess/prepare?processName=${process}&hookUrl=${hookUrl}&requestSourceType=MOBILE`)
            .then((processInfo) => {
                if (useSystemBrowser) {
                    return this.executeWithSystemBrowser(processInfo);
                } else {
                    return this.executeWithInAppBrowser(processInfo, process);
                }
            }).then(output => {
                return this.httpService.get('/services/webprocess/decode?encodedProcessdata=' + output);
            });
    }

    private executeWithSystemBrowser(processInfo: string): Promise<any> {
        return new Promise((resolve) => {
            const oauthAdress = '^services/webprocess/LOGIN';
            const deregister = this.extAppMessageService.subscribe(oauthAdress, message => {
                resolve(message.data['process_output']);
                deregister();
            });
            window.open(this.app.deployedUrl + 'services/webprocess/start?process=' + encodeURIComponent(processInfo), '_system');
        });
    }

    private executeWithInAppBrowser(processInfo: string, process: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const ref = cordova.InAppBrowser.open(this.app.deployedUrl + 'services/webprocess/start?process=' + encodeURIComponent(processInfo), '_blank', 'location=yes,clearcache=yes');
            let isSuccess = false;
            ref.addEventListener('loadstop', () => {
                ref.executeScript({ code: this.getScriptToInject(process)}, output => {
                    if (output && output[0]) {
                        isSuccess = true;
                        ref.close();
                        resolve(output[0]);
                    }
                });
            });
            ref.addEventListener('exit', () => {
                if (!isSuccess) {
                    reject('Login process is stopped');
                }
            });
        }).then((output) => {
            let url = this.app.deployedUrl;
            if (url.endsWith('/')) {
                url = url.substr(0, url.length - 1);
            }
            return this.cookieService.setCookie(url, 'WM_WEB_PROCESS', processInfo)
                .then(() => output);
        });
    }

    private getScriptToInject(process: string): string {
        return `
            (function() {
                var elements = document.querySelectorAll('body.flex>a.link');
                for (var i = 0; i < elements.length; i++) {
                    var href = elements[i].href;
                    if (href && href.indexOf('://services/webprocess/${process}?process_output=')) {
                        return href.split('process_output=')[1];
                    }
                }
                window.isWebLoginProcess = true;
            })();
        `;
    }
}
