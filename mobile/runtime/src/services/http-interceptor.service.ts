import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { App, hasCordova, removeExtraSlashes } from '@wm/core';
import { DeviceService, NetworkService } from '@wm/mobile/core';

@Injectable()
export class MobileHttpInterceptor implements HttpInterceptor {

    private static REMOTE_SERVICE_URL_PATTERNS = [
        new RegExp('^((./)|/)?services/'),
        new RegExp('j_spring_security_check'),
        new RegExp('j_spring_security_logout')
    ];

    public constructor(private app: App, private deviceService: DeviceService, private networkService: NetworkService) {}

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let modifiedRequest = request;
        let url = request.url;
        // if necessary, prepend deployed url
        if (url.indexOf('://') < 0
            && MobileHttpInterceptor.REMOTE_SERVICE_URL_PATTERNS.find(r => r.test(url))) {
            url = this.app.deployedUrl + url;
        }
        url = removeExtraSlashes(url);
        if (url !== request.url) {
            modifiedRequest = request.clone({
                url: url
            });
        }
        const subject = new Subject<HttpEvent<any>>();
        this.deviceService.whenReady().then(() => {
            next.handle(modifiedRequest).subscribe(subject);
            subject.subscribe({ error: value => this.onHttpError(value) });
        });
        return subject;
    }

    private onHttpError(response: HttpResponse<any>) {
        if (hasCordova
            && (!response || !response.status || response.status < 0 || response.status === 404)
            && (this.networkService.isConnected())) {
            this.networkService.isAvailable(true);
        }
    }
}