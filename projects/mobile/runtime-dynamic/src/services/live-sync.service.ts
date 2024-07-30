import { Observable } from 'rxjs';

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { File } from '@awesome-cordova-plugins/file/ngx';

import { App, hasCordova, transformFileURI } from '@wm/core';
import { DeviceService, NetworkService } from '@wm/mobile/core';

declare const $;
declare const window, location, cordova;

interface Settings {
    enabled: boolean,
    position: {
        left: number,
        top: number,
    },
    show: boolean,
    cordovaPlugins: {}
}

@Injectable()
export class LiveSyncInterceptor implements HttpInterceptor {

    private urlsToSkip: string[] = [];
    private deployedUrl = '';
    private localAppUrl = '';
    private syncAppUrl = '';
    private urlsToLoadFromLocal = {
        'config.json': 'config.json',
    };
    private urlsToLoadFromLive = {
        'metadata/app/service-definitions.json': 'services/servicedefs',
        'metadata/app/security-config.json': 'services/security/info'
    };
    private prefabServicePattern = /^metadata\/prefabs\/.*\/service-definitions.json$/;
    private isLiveSyncEnabled = false;
    private settings: Settings = {
        enabled: false,
        position: null,
        show: true,
        cordovaPlugins: null
    };

    constructor(private app: App,
        private deviceService: DeviceService,
        private networkService: NetworkService,
        private file: File) {
            this.loadSettings();
            this.isLiveSyncEnabled = this.settings.enabled && hasCordova();
            this.deployedUrl = $('meta[name="liveSync.deployedUrl"]').attr('value');
            this.localAppUrl = $('meta[name="liveSync.localAppUrl"]').attr('value');
            this.syncAppUrl = $('meta[name="liveSync.syncAppUrl"]').attr('value');
            this.defineAPI();
            if (!this.isLiveSyncEnabled) {
                this.goToLocalApp();
                if (this.deviceService.isAppConnectedToPreview()) {
                    this.deviceService.whenReady().then(() => {
                        this.deployedUrl = app.deployedUrl;
                        if (!this.networkService.isConnected()) {
                            return;
                        }
                        this.renderUI();
                        if (!this.localAppUrl && !this.settings.cordovaPlugins) {
                            this.getPlugins().then(plugins => {
                                this.settings.cordovaPlugins = plugins;
                                this.saveSettings();
                            });
                        }
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
                this.renderUI();
            } else {
                window.navigator.splashscreen.hide = () => {};
                this.deployedUrl = app.deployedUrl;
                this.isLiveSyncEnabled = false;
                this.deviceService.whenReady().then(() => {
                    this.networkService.isConnected() && this.launch();
                });
            }
    }

    private goToLocalApp() {
        if (this.localAppUrl) {
            location.href = this.localAppUrl;
        }
    }

    private defineAPI() {
        (window as any).liveSync = (flag) => {
            if (this.settings.enabled === !!flag
                || !this.networkService.isConnected()) {
                return;
            }
            this.settings.enabled = !!flag;
            this.saveSettings();
            setTimeout(() => {
                window.navigator.splashscreen.show();
                location.reload();
            }, 100);
        };
    }

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
        if (!this.isLiveSyncEnabled) {
            return next.handle(request);
        }
        const deployedUrl = this.app.deployedUrl;
        let url = request.url;
        url = this.urlsToLoadFromLive[url] || this.urlsToLoadFromLocal[url] || url;
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
            const port = location.port ? ':' + location.port : '';
            let path = this.localAppUrl ||
                (`${location.protocol}//${location.hostname}${port}${location.pathname}`);
            let cordovaPath = path;
            if (cordovaPath.endsWith('.html')) {
                const splits = cordovaPath.split('/').slice(0, );
                cordovaPath = splits.slice(0, splits.length - 1).join('/');
            }
            cordovaPath += '/cordova.js';
            const mAppUrl = `${location.protocol}//${location.hostname}${port}${transformFileURI(localDir + 'live-index.html')}`;
            fileContent = fileContent.replace('cordova.js', cordovaPath);
            fileContent = fileContent.replace('<head>', `
            <head>
                <base href="${this.deployedUrl}">
                <meta name="liveSync.deployedUrl" value="${this.deployedUrl}">
                <meta name="liveSync.syncAppUrl" value="${mAppUrl}">
                <meta name="liveSync.localAppUrl" value="${path}">`);
            return this.file.writeFile(localDir, 'live-index.html', fileContent, {
                replace: true
            }).then(()  => mAppUrl);
        });
    }

    private getPlugins() {
        return new Promise((resolve, reject) => {
            $.get(this.deployedUrl + 'config.xml').done(function (res) {
                const plugins = {};
                $(res).find('plugin').each(function (p) {
                    plugins[$(this).attr('name')] = $(this).attr('spec');
                });
                resolve(plugins);
            }).fail(reject);
        });
    }

    private hasPluginsChanged() {
        return this.deviceService.whenReady()
        .then(() => this.getPlugins())
        .then(plugins => {
            const pluginsInApk = this.settings.cordovaPlugins || {};
            return !!Object.keys(plugins)
                .find(k => !pluginsInApk[k] || pluginsInApk[k] !== plugins[k]);
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
            if (this.networkService.isConnected()){
                window.navigator.splashscreen.show();
                this.launch();
            }
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
        const value = sessionStorage.getItem('wm.liveSync.settings');
        try {
            this.settings = value ? JSON.parse(value) : this.settings;
        } catch(e) {
            this.saveSettings();
        }
    }

    public saveSettings() {
        sessionStorage.setItem('wm.liveSync.settings', JSON.stringify(this.settings));
    }

    public renderUI() {
        if (this.settings.enabled) {
            this.hasPluginsChanged().then((changed) => {
                if (changed) {
                    new DialogComponent({
                        title: 'Require new build',
                        info: 'Cordova Plugins in this app do not match with configuration of project in Studio.' +
                        ' So, new Cordova Build is required for Live Sync to work properly.',
                        iconClass: 'fa fa-warning fa-4x live-sync-warning-icon',
                        actions: [{
                            title: 'Got it',
                            primary: true
                        }]
                    }).render();
                }
            });
        }
        new LiveSyncComponent(this.settings, () => {
            this.saveSettings();
        }).render();
    }

}

class DialogComponent {
    private $ele: any = $('<div><div>');

    constructor(public options: {
        title? : string,
        info? : string,
        iconClass?: string,
        actions? : {
            title: string,
            action?: (dialog: DialogComponent) => void,
            primary?: boolean
        }[]
    }) {

    }

    dismiss() {
        this.$ele.remove();
    }

    render() {
        this.$ele = $(
            `<div class="live-sync-modal live-sync-control">
                    <div class="live-sync-info-container">
                        <span class="${this.options.iconClass}">
                        </span>
                        <label class="live-sync-title">
                            ${this.options.title}
                        </label>
                        <label class="live-sync-description">
                            ${this.options.info}
                        </label>
                        <div class="live-sync-action-panel">
                            ${this.options.actions.map((a) => {
                                return a ? `
                                <button
                                    type="button"
                                    class="live-sync-action ${a.primary ? ' live-sync-primary-action' : ''}">
                                        ${a.title}
                                </button>` : '';
                            }).join('')}
                        </div>
                    </div>
                </div>
            `
        );
        $('body').append(this.$ele);
        const _this = this;
        this.$ele.find('.live-sync-action').each(function(index) {
            $(this).bind('click', () => {
                const action = _this.options.actions[index].action;
                if (action) {
                    action(_this);
                }
                _this.dismiss();
            });
        });
    }
}

class LiveSyncComponent {
    private $ele = $(
        `<div class="live-sync-control">
            <button class="live-sync-control-btn" type="button">
            </button>
        </div>`);

    constructor(private settings: Settings, private onChange: () => void) {

    }

    private setPosition() {
        const menuIcon = this.$ele.find('.live-sync-control-btn');
        const position = this.settings.position;
        if(position) {
            menuIcon.css('left', position.left + 'px');
            menuIcon.css('top', position.top + 'px');
        }
    }

    private listenForShowEvent() {
        $('body').bind('touchstart', () => {
            const timerId = setTimeout(() => {
                this.settings.show = true;
                this.onChange();
                this.showConfirmation();
            }, 5000);
            $('body').bind('touchend', () => {
                clearTimeout(timerId);
            });
        });
    }

    private showConfirmation() {
        new DialogComponent({
            title: 'Enable Live Sync?',
            info: 'App UI is pulled from studio. But, offline functionality is turned off.',
            iconClass: 'live-sync-control-icon',
            actions: [{
                title: 'No',
                action: () => {
                    this.settings.show = false;
                    this.onChange();
                    this.showHelpInfo();
                }
            }, {
                title: 'Yes',
                action: () => {
                    window.liveSync(true);
                },
                primary: true
            }]
        }).render();
    };

    private showHelpInfo() {
        new DialogComponent({
            title: '',
            info: 'Tap and hold anywhere for 5 seconds to turn on Live Sync.',
            iconClass: 'live-sync-retrieval-info-icon',
            actions: [{
                title: 'Got it',
                primary: true
            }]
        }).render();
    };

    private renderButton() {
        const menuIcon = this.$ele.find('.live-sync-control-btn');
        this.$ele.on('touchstart', (event) => {
            event.stopPropagation();
            let addClass = true;
            $(document).on('touchmove.liveSync', (event) => {
                var origEvent = event.originalEvent.touches[0];
                if (origEvent && origEvent.pageX) {
                    this.settings.position = {
                        left: origEvent.pageX,
                        top: origEvent.pageY
                    };
                }
                this.setPosition();
                if (addClass) {
                    menuIcon.addClass('touched');
                    addClass = false;
                }
            });
            $(document).one('touchend', (event) => {
                this.onChange();
                menuIcon.removeClass('touched');
                $(document).off('touchmove.liveSync');
            });
        });
        menuIcon.click(() => window.reloadApp());
        $('body').append(this.$ele);
    }

    public render() {
        this.setPosition();
        if (this.settings.enabled) {
            this.renderButton();
        } else if (this.settings.show) {
            this.showConfirmation();
        }
        this.listenForShowEvent();
    }
}
