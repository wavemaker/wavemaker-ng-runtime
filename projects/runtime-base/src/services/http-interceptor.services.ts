import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';

import { httpService } from '@wm/variables';

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
