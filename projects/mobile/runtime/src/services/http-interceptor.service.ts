import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';
import { from, Observable, Subject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { App, executePromiseChain, getWmProjectProperties, hasCordova, noop, removeExtraSlashes } from '@wm/core';
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
        if (hasCordova() && !CONSTANTS.isWaveLens) {
            this.requestInterceptors.push(new SecurityInterceptor(app, file, securityService));
            this.requestInterceptors.push(new RemoteSyncInterceptor(app, deviceFileDownloadService, deviceService, file, networkService));
            this.requestInterceptors.push(new ServiceCallInterceptor(app));
        }
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const subject = new Subject<HttpEvent<any>>();
        const token = localStorage.getItem(CONSTANTS.XSRF_COOKIE_NAME);
        if (token) {
            // Clone the request to add the new header
            request = request.clone({ headers: request.headers.set(getWmProjectProperties().xsrf_header_name, token) });
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

class RemoteSyncInterceptor implements RequestInterceptor {

    private checkRemoteDirectory = true;
    private hasRemoteChanges = false;

    private static URL_TO_SYNC = [
        new RegExp('page.min.json$'),
        new RegExp('app.js$'),
        new RegExp('app.variables.json$')
    ];

    constructor(private app: App,
                private deviceFileDownloadService: DeviceFileDownloadService,
                private deviceService: DeviceService,
                private file: File,
                private networkService: NetworkService) {
        this.file.checkDir(cordova.file.dataDirectory, 'remote').then(() => this.hasRemoteChanges = true, noop);
    }

    public intercept(request: HttpRequest<any>): Promise<HttpRequest<any>> {
        const isRemoteSyncEnabled = localStorage.getItem('remoteSync') === 'true';
        if (this.hasRemoteChanges || isRemoteSyncEnabled) {
            return Promise.resolve(request.url).then(url => {
                if (url.indexOf('://') < 0
                    && RemoteSyncInterceptor.URL_TO_SYNC.find(r => r.test(url))) {
                    const fileNameFromUrl = _.last(_.split(url, '/'));
                    return this.download(url, fileNameFromUrl, isRemoteSyncEnabled);
                }
                return url;
            }).then(url => {
                if (url !== request.url) {
                    this.hasRemoteChanges = true;
                    return request.clone({
                        url: url
                    });
                }
                return request;
            });
        } else {
            return Promise.resolve(request);
        }
    }

    private createFolderStructure(parentFolder: string, folderNamesList: string[]): Promise<string> {
        const folderName = folderNamesList[0];
        if (!_.isEmpty(folderName)) {
            return this.file.createDir(parentFolder, folderName, false)
                .catch(noop)
                .then(() => {
                    parentFolder = parentFolder + folderName + '/';
                    folderNamesList.shift();
                    return this.createFolderStructure(parentFolder, folderNamesList);
                });
        }
        return Promise.resolve(parentFolder);
    }

    private init(pageUrl: string, isRemoteSyncEnabled: boolean) {
        const fileName = _.last(_.split(pageUrl, '/')),
            path = _.replace(pageUrl, fileName, ''),
            folderPath = 'remote' + _.replace(path, this.app.deployedUrl, ''),
            downloadsParent = cordova.file.dataDirectory;
        return new Promise((resolve, reject) => {
                if (this.checkRemoteDirectory) {
                    return this.deviceService.getAppBuildTime().then(buildTime => {
                        const remoteSyncInfo = this.deviceService.getEntry('remote-sync') || {};
                        if (!remoteSyncInfo.lastBuildTime || remoteSyncInfo.lastBuildTime !== buildTime) {
                            return this.file.removeDir(cordova.file.dataDirectory, 'remote')
                                .catch(noop).then(() => {
                                    remoteSyncInfo.lastBuildTime = buildTime;
                                    this.hasRemoteChanges = false;
                                    return this.deviceService.storeEntry('remote-sync', remoteSyncInfo);
                                });
                        }
                    }).then(() => this.checkRemoteDirectory = false)
                        .then(resolve, reject);
                }
                resolve();
            })
            .then(() => this.file.checkDir(downloadsParent, folderPath))
            .then(() => downloadsParent + folderPath,
                () => {
                    if (isRemoteSyncEnabled) {
                        return this.createFolderStructure(downloadsParent, _.split(folderPath, '/'));
                    }
                    return Promise.reject('Could not find equivalent remote path');
                });
    }

    private download(url: string, fileName: string, isRemoteSyncEnabled: boolean): Promise<string> {
        const pageUrl = this.app.deployedUrl + '/' + url;
        let folderPath;
        return this.init(pageUrl, isRemoteSyncEnabled)
            .then(pathToRemote => {
                folderPath = pathToRemote;
                return this.file.checkFile(folderPath + fileName, '');
            }).then(() => {
                if (isRemoteSyncEnabled && this.networkService.isConnected()) {
                    return this.file.removeFile(folderPath, fileName)
                        .then(() => folderPath + fileName);
                }
                return folderPath + fileName;
            }, () => url)
            .then(path => {
                if (isRemoteSyncEnabled && this.networkService.isConnected()) {
                    return this.deviceFileDownloadService.download(pageUrl, false, folderPath, fileName);
                }
                return path;
            });
    }

}

class SecurityInterceptor implements RequestInterceptor {

    private initialized = false;
    private static PAGE_URL_PATTERN = new RegExp('page.min.json$');
    private publicPages;

    constructor(private app: App, private file: File, private securityService: SecurityService) {}

    public intercept(request: HttpRequest<any>): Promise<HttpRequest<any>> {
        return new Promise<HttpRequest<any>>((resolve, reject) => {
            if (SecurityInterceptor.PAGE_URL_PATTERN.test(request.url)) {
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
