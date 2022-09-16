import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { File } from '@awesome-cordova-plugins/file/ngx';
import { from } from 'rxjs';
import { Observable, Subject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import {
    App,
    executePromiseChain,
    getWmProjectProperties,
    hasCordova,
    removeExtraSlashes,
} from '@wm/core';
import { DeviceFileDownloadService, DeviceService, NetworkService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';
import { CONSTANTS } from '@wm/variables';

declare const cordova;
declare const _;

interface RequestInterceptor {
    intercept(request: HttpRequest<any>): Promise<HttpRequest<any>>;
}

@Injectable()
export class MobileHttpInterceptor implements HttpInterceptor {

    private requestInterceptors: RequestInterceptor[] = [];

    public constructor(private app: App,
                       file: File,
                       deviceFileDownloadService: DeviceFileDownloadService,
                       private deviceService: DeviceService,
                       private networkService: NetworkService,
                       securityService: SecurityService) {
        if (hasCordova()) {
            this.requestInterceptors.push(new SecurityInterceptor(app, file, securityService));
            this.requestInterceptors.push(new ServiceCallInterceptor(app));
        }
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const subject = new Subject<HttpEvent<any>>();
        const token = localStorage.getItem(CONSTANTS.XSRF_COOKIE_NAME);
        const xsrfHeaderName = getWmProjectProperties().xsrf_header_name;
        if (token 
            && xsrfHeaderName
            && this.app.deployedUrl 
            && (request.url.indexOf('://') < 0
                || request.url.startsWith(this.app.deployedUrl))) {
                
            // Clone the request to add the new header
            request = request.clone({ headers: request.headers.set(xsrfHeaderName, token) });
        }
        const data = {request: request};

        // invoke the request only when device is ready.
        const obs = from(this.deviceService.whenReady()
            .then(() => executePromiseChain(this.getInterceptors(), [data])));
        return obs.pipe(mergeMap(() => {
            return next.handle(data.request);
        }));
    }

    private getInterceptors() {
        return this.requestInterceptors.map(i => {
            return (data) => i.intercept(data.request).then(req => data.request = req);
        });
    }

    private onHttpError(response: HttpResponse<any>) {
        if (hasCordova
            && (!response || !response.status || response.status < 0 || response.status === 404)
            && (this.networkService.isConnected())) {
            this.networkService.isAvailable(true);
        }
    }
}

class ServiceCallInterceptor implements RequestInterceptor {

    private static REMOTE_SERVICE_URL_PATTERNS = [
        new RegExp('^((./)|/)?services/'),
        new RegExp('j_spring_security_check'),
        new RegExp('j_spring_security_logout')
    ];

    constructor(private app: App) {}

    public intercept(request: HttpRequest<any>): Promise<HttpRequest<any>> {
        let modifiedRequest = request;
        let url = request.url;
        // if necessary, prepend deployed url
        if (url.indexOf('://') < 0
            && ServiceCallInterceptor.REMOTE_SERVICE_URL_PATTERNS.find(r => r.test(url))) {
            url = this.app.deployedUrl + url;
        }
        url = removeExtraSlashes(url);
        if (url !== request.url) {
            modifiedRequest = request.clone({
                url: url
            });
        }
        return Promise.resolve(modifiedRequest);
    }

}

class SecurityInterceptor implements RequestInterceptor {

    private initialized = false;
    private static PAGE_URL_PATTERN = new RegExp('page.min.json$');
    private static PREFAB_URL_PATTERN = new RegExp('^app/prefabs/.*/page.min.json$');
    private publicPages;

    constructor(private app: App, private file: File, private securityService: SecurityService) {}

    public intercept(request: HttpRequest<any>): Promise<HttpRequest<any>> {
        return new Promise<HttpRequest<any>>((resolve, reject) => {
            if (!SecurityInterceptor.PREFAB_URL_PATTERN.test(request.url) 
                && SecurityInterceptor.PAGE_URL_PATTERN.test(request.url)) {
                return Promise.resolve().then(() => {
                    if (!this.initialized) {
                        return this.init();
                    }
                }).then(() => {
                    const urlSplits = _.split(request.url, '/');
                    const pageName = urlSplits[urlSplits.length - 2];
                    if (!this.publicPages || this.publicPages[pageName]) {
                        return Promise.resolve(request);
                    } else {
                        this.securityService.getConfig(config => {
                            if (!config.securityEnabled || config.authenticated) {
                                resolve(request);
                            } else {
                                reject(`Page '${pageName}' is not accessible to the user.`);
                                this.app.notify('http401', { page: pageName});
                            }
                        }, () => reject(`Security call failed.`));
                    }
                    return Promise.resolve(request);
                }).then(resolve, reject);
            }
            return resolve(request);
        });
    }

    /**
     * loads public pages from 'metadata/app/public-pages.info' and overrides canAccess method SecurityService
     */
    private init(): Promise<any> {
        const folderPath = cordova.file.applicationDirectory + 'www/metadata/app',
            fileName = 'public-pages.json';
        return this.file.readAsText(folderPath, fileName).then(text => {
            if (!this.initialized) {
                this.publicPages = {};
                this.initialized = true;
                _.forEach(JSON.parse(text), pageName => this.publicPages[pageName] = true);
            }
        }).catch(() => {
            this.initialized = true;
        });
    }
}
