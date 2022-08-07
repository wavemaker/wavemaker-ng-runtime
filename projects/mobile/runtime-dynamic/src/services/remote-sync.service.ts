import { Observable } from 'rxjs';

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { File } from '@awesome-cordova-plugins/file/ngx';

import { App, hasCordova, transformFileURI } from '@wm/core';
import { DeviceService, IDeviceStartUpService } from '@wm/mobile/core';

declare const window, location, cordova;
declare const $, _;

@Injectable()
export class RemoteSyncInterceptor implements HttpInterceptor, IDeviceStartUpService {

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

    constructor(private app: App,
        private deviceService: DeviceService,
        private file: File) {
            const config = this.deviceService.getConfig();
            this.isRemoteSyncEnabled = 
                (localStorage.getItem('remoteSync') === 'true'
                    || config.enableRemoteSync)
                && hasCordova();
            this.deployedUrl = $('meta[name="remoteSync.deployedUrl"]').attr('value');
            this.localAppUrl = $('meta[name="remoteSync.localAppUrl"]').attr('value');
            this.syncAppUrl = $('meta[name="remoteSync.syncAppUrl"]').attr('value');
            (window as any).remoteSync = (flag) => {
                localStorage.setItem('remoteSync', flag ? 'true' : 'false');
                setTimeout(() => {
                    window.navigator.splashscreen.show();
                    location.reload();
                }, 100);
            };
            if (!this.isRemoteSyncEnabled) {
                if (this.localAppUrl) {
                    window.navigator.splashscreen.show();
                    location.href = this.localAppUrl;
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
                this.renderUI();
            } else {
                this.deviceService.addStartUpService(this);
                this.deployedUrl = app.deployedUrl;
                this.isRemoteSyncEnabled = false;
            }
    }

    public start() {
        return this.launch().then(() => {
            return new Promise(resolve => setTimeout(resolve, 2000));
        });
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
            let path = this.localAppUrl || location.pathname;
            let cordovaPath = path;
            if (cordovaPath.endsWith('.html')) {
                const splits = cordovaPath.split('/').slice(0, );
                cordovaPath = splits.slice(0, splits.length - 1).join('/');
            }
            cordovaPath += '/cordova.js';
            const mAppUrl = transformFileURI(localDir + 'remote-index.html');
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

    public renderUI() {
        var $ele = $(
            ` <div class="wavelensAppLauncher">
            	<a class="waveLensAnchor app-anchor" role="button" on-tap="waveLensAnchorTap($event, $scope)" href="javascript:void(0)">
            		<i class="app-icon wi wi-refresh fa-2x"></i>
            		<span class="anchor-caption"></span>
            	</a>
            </div>`);
        $('body').append($ele);
        $ele.on('touchstart', function(event) {
            event.stopPropagation();
            var menuIcon = $('.wavelensAppLauncher .waveLensAnchor'),
                addClass = true;
            $(document).on('touchmove.wavelens', function(event) {
                var origEvent = event.originalEvent.touches[0];
                menuIcon.css('left', origEvent.pageX + 'px');
                menuIcon.css('top', origEvent.pageY + 'px');
                if (addClass) {
                    menuIcon.addClass('touched');
                    addClass = false;
                }
            });
            $(document).one('touchend', function() {
                menuIcon.removeClass('touched');
                $(document).off('touchmove.wavelens');
            });
        });
        $ele.find('>.waveLensAnchor').click(function() {
            window.reloadApp();
        });
        $('body').append(`
            <style type="text/css">
                .wm-app .wavelensAppLauncher a,
                .wm-app .wavelensAppLauncher a:focus,
                .wm-app .wavelensAppLauncher a:hover,
                .wm-app .wavelensAppLauncher label {
                    text-decoration: none;
                    color: #4F8ACC;
                    padding: 0;
                    margin: 0;
                }

                .wm-app .wavelensmenu .wi {
                    font-size: 10em;
                }

                .wm-app .wavelensAppLauncher a.waveLensAnchor,
                .wm-app .wavelensAppLauncher a.waveLensAnchor:hover .wm-app .wavelensAppLauncher a.waveLensAnchor:focus {
                    position: fixed;
                    top: calc(100% - 100pt);
                    left: calc(100% - 50pt);
                    padding: 5px;
                    text-decoration: none;
                    border-radius: 100px;
                    background-color: #191919;
                    color: #4F8ACC;
                    z-index: 1000;
                    box-shadow: 1px 2px 5px #000;
                }

                .wavelensAppLauncher .waveLensAnchor.touched {
                    opacity: 1;
                    background-color: #333;
                    box-shadow: 10px 11px 5px #000;
                }

                .wavelensAppLauncher .waveLensAnchor .app-icon {
                    font-size: 3em;
                    padding: 0;
                }
            </style>
        `);
    }

}