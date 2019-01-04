import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { httpService } from '@wm/variables';

declare const _WM_APP_PROPERTIES;
declare const cordova;
declare const _;

/**
 * This Interceptor intercepts all network calls and if a network call fails
 * due to session timeout, then it calls a function to handle session timeout.
 */
@Injectable()
export class HttpCallInterceptor implements HttpInterceptor {

    constructor() {}
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone();
        return next.handle(request).pipe(
            tap(event => {},
                error => {
                    if (httpService.isPlatformSessionTimeout(error)) {
                        httpService.handleSessionTimeout(request);
                    }
                }
            )
        );
    }
}