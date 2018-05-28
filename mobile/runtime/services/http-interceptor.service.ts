import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { App } from '@wm/core';
import { DeviceService } from '@wm/mobile/core';

@Injectable()
export class MobileHttpInterceptor implements HttpInterceptor {

    private static REMOTE_SERVICE_URL_PATTERNS = [
        new RegExp('^((./)|/)?services/'),
        new RegExp('j_spring_security_check'),
        new RegExp('j_spring_security_logout')
    ];

    public constructor(private app: App, private deviceService: DeviceService) {}

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let modifiedRequest = request;
        if (request.url.indexOf('://') < 0
            && MobileHttpInterceptor.REMOTE_SERVICE_URL_PATTERNS.find(r => r.test(request.url))) {
            modifiedRequest = request.clone({
                url: this.app.deployedUrl + request.url
            });
        }
        const subject = new Subject<HttpEvent<any>>();
        this.deviceService.whenReady().then(() => {
            next.handle(modifiedRequest).subscribe(subject);
        });
        return subject;
    }
}