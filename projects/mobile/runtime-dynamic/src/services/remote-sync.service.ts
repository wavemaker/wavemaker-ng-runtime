import { Observable } from 'rxjs';

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { File } from '@awesome-cordova-plugins/file/ngx';

import { App, hasCordova, transformFileURI } from '@wm/core';
import { DeviceService } from '@wm/mobile/core';

declare const window, navigator, location, cordova;
declare const $, _;

@Injectable()
export class RemoteSyncInterceptor implements HttpInterceptor {

    private urlsToSkip: string[] = [];
    private deployedUrl = '';
    private localAppUrl = '';
    private syncAppUrl = '';
    private urlsToLoadFromLocal = {
        'config.json': 'config.json',
    };
    private urlsToLoadFromRemote = {
        'metadata/app/service-definitions.json': 'services/servicedefs',
        'metadata/app/security-config.json': 'services/security/info'
    };
    private prefabServicePattern = /^metadata\/prefabs\/.*\/service-definitions.json$/;
    private isRemoteSyncEnabled = false;
    private settings: {
        enabled: boolean,
        position: {
            left: number,
            top: number,
        },
        show: boolean
    } = {
        enabled: false,
        position: null,
        show: true 
    };

    constructor(private app: App,
        private deviceService: DeviceService,
        private file: File) {
            this.loadSettings();
            this.isRemoteSyncEnabled = this.settings.enabled && hasCordova();
            this.deployedUrl = $('meta[name="remoteSync.deployedUrl"]').attr('value');
            this.localAppUrl = $('meta[name="remoteSync.localAppUrl"]').attr('value');
            this.syncAppUrl = $('meta[name="remoteSync.syncAppUrl"]').attr('value');
            (window as any).remoteSync = (flag) => {
                this.settings.enabled = !!flag;
                this.saveSettings();
                setTimeout(() => {
                    window.navigator.splashscreen.show();
                    location.reload();
                }, 100);
            };
            if (!this.isRemoteSyncEnabled) {
                if (this.localAppUrl) {
                    location.href = this.localAppUrl;
                }
                if (this.deviceService.isAppConnectedToPreview()) {
                    this.deviceService.whenReady().then(() => {
                        this.renderUI(false);
                    });
                }
                return;
            }
            if (this.syncAppUrl && this.deployedUrl) {
                this.deviceService.getConfig().baseUrl = this.deployedUrl;
                this.patchSQLite();
                this.patchHistoryApi();
                Object.keys(this.urlsToLoadFromLocal).forEach(k => {
                    this.urlsToLoadFromLocal[k] = this.syncAppUrl + this.urlsToLoadFromLocal[k];
                });
                this.patchApp();
                this.renderUI(true);
            } else {
                window.navigator.splashscreen.hide = () => {};
                this.deployedUrl = app.deployedUrl;
                this.isRemoteSyncEnabled = false;
                this.deviceService.whenReady().then(() => this.launch());
            }
    }

    public getServiceName: () => 'RemoteSyncInterceptor';

    private transformPrefabServicedefinitions(url: string) {
        let isValid = this.prefabServicePattern.test(url),
            prefabName = '',
            prefabLoc = 0;
        if (isValid) {
            prefabLoc = 'metadata/prefabs/'.length;
            prefabName = url.substring(prefabLoc, url.indexOf('/', prefabLoc));
            return 'services/prefabs/' + prefabName + '/servicedefs';
        }
        return url;
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRemoteSyncEnabled) {
            return next.handle(request);
        }
        const deployedUrl = this.app.deployedUrl;
        let url = request.url;
        url = this.urlsToLoadFromRemote[url] || this.urlsToLoadFromLocal[url] || url;
        url = this.transformPrefabServicedefinitions(url);
        if (url.startsWith('//')) {
            url = deployedUrl.split('//')[0] + url;
        }
        if (url.indexOf('://') < 0
            || this.urlsToSkip.indexOf(url) >= 0) {
            url = deployedUrl + '/' + url;
        }
        request = request.clone({url: url});
        return next.handle(request);
    }

    private mashUpHtmlFile() {
        const localDir = cordova.file.cacheDirectory;
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.deployedUrl + 'index.html',
                dataType: 'html',
                success: resolve,
                error: reject
            });
        }).then((fileContent: string) => {
            let path = this.localAppUrl || 
                (`${location.protocol}//${location.hostname}${location.pathname}`);
            let cordovaPath = path;
            if (cordovaPath.endsWith('.html')) {
                const splits = cordovaPath.split('/').slice(0, );
                cordovaPath = splits.slice(0, splits.length - 1).join('/');
            }
            cordovaPath += '/cordova.js';
            const mAppUrl = `${location.protocol}//${location.hostname}${transformFileURI(localDir + 'remote-index.html')}`;
            fileContent = fileContent.replace('cordova.js', cordovaPath);
            fileContent = fileContent.replace('<head>', `
            <head>
                <base href="${this.deployedUrl}">
                <meta name="remoteSync.deployedUrl" value="${this.deployedUrl}">
                <meta name="remoteSync.syncAppUrl" value="${mAppUrl}">
                <meta name="remoteSync.localAppUrl" value="${path}">`);
            return this.file.writeFile(localDir, 'remote-index.html', fileContent, {
                replace: true
            }).then(()  => mAppUrl);
        });
    }

    private launch() {
        return this.mashUpHtmlFile()
            .then((filePath) => {
                localStorage.setItem('WM.NetworkService.isConnected', 'true');
                localStorage.setItem('WM.NetworkService._autoConnect', 'true');
                sessionStorage.setItem('debugMode', 'true');
                setTimeout(() => {
                    window.navigator.splashscreen.show();
                    window.location.href = filePath;
                }, 2000);
            });
    }

    private patchSQLite() {
        // Offline sql is not supported.
        delete window['SQLitePlugin'];
    }

    private patchApp() {
        this.app.reload = () => {
            window.navigator.splashscreen.show();
            this.launch();
        };
        window['reloadApp'] = this.app.reload;
    }

    private patchHistoryApi() {
        const location = this.syncAppUrl;
        const origReplace = window.history.replaceState;
        window.history.replaceState = (state: any, title: string, url: string) => {
            if (url.startsWith('#')) {
                url = location + url;
            }
            origReplace.call(window.history, state, title, url);
        };
        const origPush = window.history.pushState;
        window.history.pushState = (state: any, title: string, url: string) =>  {
            if (url.startsWith('#')) {
                url = location + url;
            }
            origPush.call(window.history, state, title, url);
        };
    }

    public loadSettings() {
        const value = localStorage.getItem('wm.remoteSync.settings');
        try {
            this.settings = value ? JSON.parse(value) : this.settings;
        } catch(e) {
            this.saveSettings();
        }
    }

    public saveSettings() {
        localStorage.setItem('wm.remoteSync.settings', JSON.stringify(this.settings));
    }

    public renderUI(enabled: boolean) {
        const $ele = $(
            `<div class="remote-sync-control">
            	<button class="remote-sync-control-btn" type="button">
            	</button>
            </div>`);
        const setPosition = () => {
            const menuIcon = $ele.find('.remote-sync-control-btn');
            const position = this.settings.position;
            if(position) {
                menuIcon.css('left', position.left + 'px');
                menuIcon.css('top', position.top + 'px');
            }
        };
        const listenForShowEvent = () => {
            $('body').bind('touchstart', () => {
                const timerId = setTimeout(() => {
                    this.settings.show = true;
                    this.saveSettings();
                    showConfirmation();
                }, 5000);
                $('body').bind('touchend', () => {
                    clearTimeout(timerId);
                });
            });
        };
        const showConfirmation = () => {
            navigator.notification.confirm(
                'In Sync mode, App UI is pulled from Studio.' +
                ' Offline functionality is not supported in Sync mode.' +
                ' Would you like to turn on Sync mode?', 
                (index) => {
                    if (index === 2) {
                        window.remoteSync(true);
                    } else if (index === 1) {
                        this.settings.show = false;
                        this.saveSettings();
                        navigator.notification.alert(
                            `To turn on sync mode, tap and hold anywhere for five seconds.`,
                            () => {},
                            'Information');
                    }
                },
                'Turn on Sync mode', ['No', 'Yes']);
        };
        const init = () => {
            const menuIcon = $ele.find('.remote-sync-control-btn');
            $ele.on('touchstart', (event) => {
                event.stopPropagation();
                let addClass = true;
                $(document).on('touchmove.remoteSync', (event) => {
                    var origEvent = event.originalEvent.touches[0];
                    if (origEvent && origEvent.pageX) {
                        this.settings.position = {
                            left: origEvent.pageX,
                            top: origEvent.pageY
                        };
                    }
                    setPosition();
                    if (addClass) {
                        menuIcon.addClass('touched');
                        addClass = false;
                    }
                });
                $(document).one('touchend', (event) => {
                    this.saveSettings();
                    menuIcon.removeClass('touched');
                    $(document).off('touchmove.remoteSync');
                });
            });
            menuIcon.click(() => window.reloadApp());
        };
        setPosition();
        if (this.settings.enabled) {
            init();
            $('body').append($ele);
        } else if (this.settings.show) {
            showConfirmation();
        }
        listenForShowEvent();
    }

}