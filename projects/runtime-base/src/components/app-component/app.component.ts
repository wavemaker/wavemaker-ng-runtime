import { ApplicationRef, Component, DoCheck, ElementRef, NgZone, ViewEncapsulation, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';

import { setTheme } from 'ngx-bootstrap/utils';

import { noop } from '@wm/core';
import { $invokeWatchers, AbstractDialogService, AbstractSpinnerService, getWmProjectProperties, hasCordova, setAppRef, setNgZone, setPipeProvider, App, addClass, removeClass } from '@wm/core';
import { OAuthService } from '@wm/oAuth';
import { AppManagerService } from '../../services/app.manager.service';
import { PipeProvider } from '../../services/pipe-provider.service';

interface SPINNER {
    show: boolean;
    messages: Array<string>;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements DoCheck, AfterViewInit {
    public startApp = false;
    public isApplicationType = false;

    @ViewChild(RouterOutlet) routerOutlet: RouterOutlet;

    @ViewChild('dynamicComponent', {read: ViewContainerRef}) dynamicComponentContainerRef: ViewContainerRef;

    spinner: SPINNER = {show: false, messages: []};
    constructor(
        _pipeProvider: PipeProvider,
        _appRef: ApplicationRef,
        private elRef: ElementRef,
        private oAuthService: OAuthService,
        private dialogService: AbstractDialogService,
        private spinnerService: AbstractSpinnerService,
        ngZone: NgZone,
        private router: Router,
        private app: App,
        private appManager: AppManagerService
    ) {
        setPipeProvider(_pipeProvider);
        setNgZone(ngZone);
        setAppRef(_appRef);

        this.isApplicationType = getWmProjectProperties().type === 'APPLICATION';

        // subscribe to OAuth changes
        oAuthService.getOAuthProvidersAsObservable().subscribe((providers: any) => {
            this.providersConfig = providers;
            if (providers.length) {
                this.showOAuthDialog();
            } else {
                this.closeOAuthDialog();
            }
        });

        // Subscribe to the message source to show/hide app spinner
        this.spinnerService.getMessageSource().asObservable().subscribe((data: any) => {
            // setTimeout is to avoid 'ExpressionChangedAfterItHasBeenCheckedError'
            setTimeout(() => {
                this.spinner.show = data.show;
                this.spinner.messages = data.messages;
            });
        });

        // set theme to bs3 on ngx-bootstrap. This avoids runtime calculation to determine bs theme. Thus resolves performance.
        setTheme('bs3');

        let spinnerId;

        let onPageRendered = noop;

        this.router.events.subscribe(e => {
            if (e instanceof NavigationStart) {
                spinnerId = this.spinnerService.show('', 'globalSpinner');
                const node = document.querySelector('app-page-outlet') as HTMLElement;
                if (node) {
                    addClass(node, 'page-load-in-progress');
                }
                let page = e.url.split('?')[0];
                page = page.substring(1);
                console.time(page + ' Load Time');
                onPageRendered = () => {
                    this.spinnerService.hide(spinnerId);
                    const node = document.querySelector('app-page-outlet') as HTMLElement;
                    if (node) {
                        removeClass(node, 'page-load-in-progress');
                    }
                    onPageRendered = noop;
                    console.timeEnd(page + ' Load Time');
                };
            } else if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
                setTimeout(() =>{
                    onPageRendered();
                }, 1000);
            }
        });
        this.appManager.subscribe('pageReady', () => {
            onPageRendered();
        });
        this.appManager.subscribe('pageAttach', () => {
            onPageRendered();
        });
    }

    providersConfig;
    isOAuthDialogOpen = false;

    showOAuthDialog() {
        if (!this.isOAuthDialogOpen) {
            this.isOAuthDialogOpen = true;
            this.dialogService.open('oAuthLoginDialog', this);
        }
    }

    closeOAuthDialog() {
        if (this.isOAuthDialogOpen) {
            this.isOAuthDialogOpen = false;
            this.dialogService.close('oAuthLoginDialog', this);
        }
    }

    private start() {
        this.startApp = true;
        setTimeout(() => {
            this.app.dynamicComponentContainerRef = this.dynamicComponentContainerRef;
            this.overrideRouterOutlet();
        }, 10);
    }

    private overrideRouterOutlet() {
        //override the attach/detach methods
        const oAttach = this.routerOutlet.attach;
        const oDetach = this.routerOutlet.detach;
        this.routerOutlet.attach = (componentRef: any) => {
            oAttach.call(this.routerOutlet, componentRef);
            componentRef.instance.ngOnAttach();
        };
        this.routerOutlet.detach = () => {
            const componentRef = oDetach.call(this.routerOutlet);
            componentRef.instance.ngOnDetach();
            return componentRef;
        };
    }

    ngAfterViewInit() {
        if (hasCordova() && !window['wmDeviceReady']) {
            document.addEventListener('wmDeviceReady' , () => this.start());
        } else {
            this.start();
        }
    }

    ngDoCheck() {
        $invokeWatchers();
    }
}
