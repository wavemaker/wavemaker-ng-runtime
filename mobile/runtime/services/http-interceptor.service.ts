import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { fetchContent, hasCordova, preventCachingOf } from '@wm/core';
import { DeviceService } from '@wm/mobile/core';
import { $rootScope } from '@wm/variables';

@Injectable()
export class MobileHttpInterceptor implements HttpInterceptor {

    private static REMOTE_SERVICE_URL_PATTERNS = [
        new RegExp('^((./)|/)?services/'),
        new RegExp('j_spring_security_check'),
        new RegExp('j_spring_security_logout')
    ];

    private _deployedUrl: string;

    public constructor(private deviceService: DeviceService) {
        this._deployedUrl = this.getDeployedUrl();
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let modifiedRequest = request;
        if (MobileHttpInterceptor.REMOTE_SERVICE_URL_PATTERNS.find(r => r.test(request.url))) {
            modifiedRequest = request.clone({
                url: this._deployedUrl + request.url
            });
        }
        const subject = new Subject<HttpEvent<any>>();
        this.deviceService.whenReady().then(() => {
            next.handle(modifiedRequest).subscribe(subject);
        });
        return subject;
    }

    private getDeployedUrl(): string {
        const waveLensAppUrl = window['WaveLens'] && window['WaveLens']['appUrl'];
        let deployedUrl = $rootScope.project.deployedUrl;
        if (hasCordova()) {
            if (waveLensAppUrl) {
                // TODO: Temporary Fix for WMS-13072, baseUrl is {{DEVELOPMENT_URL}} in wavelens
                deployedUrl = waveLensAppUrl;
            } else {
                fetchContent('json', preventCachingOf('./config.json'), true, (response => {
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
}