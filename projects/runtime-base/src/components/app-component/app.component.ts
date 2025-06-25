import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import { AlertDialogComponent } from '@wm/components/dialogs/alert-dialog';
import { ConfirmDialogComponent } from '@wm/components/dialogs/confirm-dialog';
import {
    AfterViewInit,
    ApplicationRef,
    Component,
    DoCheck,
    ElementRef,
    NgZone,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {
    ActivatedRoute,
    NavigationCancel,
    NavigationEnd,
    NavigationError,
    NavigationStart,
    Router,
    RouterOutlet
} from '@angular/router';

import { setTheme } from 'ngx-bootstrap/utils';

import {
    $invokeWatchers,
    AbstractDialogService,
    AbstractSpinnerService,
    addClass,
    App,
    CustomIconsLoaderService,
    getWmProjectProperties,
    noop,
    removeClass,
    setAppRef,
    setNgZone,
    setPipeProvider
} from '@wm/core';
import { OAuthService } from '@wm/oAuth';
import { AppManagerService } from '../../services/app.manager.service';
import { PipeProvider } from '../../services/pipe-provider.service';
import { AppSpinnerComponent } from '../app-spinner.component';
import { DialogComponent } from '@wm/components/dialogs/design-dialog';

interface SPINNER {
    show: boolean;
    messages: Array<string>;
    arialabel: string;
}

@Component({
    standalone: true,
    imports: [CommonModule, WmComponentsModule, RouterOutlet, AlertDialogComponent, ConfirmDialogComponent, DialogComponent, AppSpinnerComponent],
    selector: 'app-root',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements DoCheck, AfterViewInit {
    public startApp = false;
    public isApplicationType = false;

    @ViewChild(RouterOutlet) routerOutlet: RouterOutlet;

    @ViewChild('dynamicComponent', { read: ViewContainerRef }) dynamicComponentContainerRef: ViewContainerRef;

    spinner: SPINNER = { show: false, messages: [], arialabel: '' };
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
        private appManager: AppManagerService,
        private customIconsLoaderService: CustomIconsLoaderService
    ) {
        setPipeProvider(_pipeProvider);
        setNgZone(ngZone);
        setAppRef(_appRef);

        this.isApplicationType = getWmProjectProperties().type === 'APPLICATION';
        if (this.isApplicationType) {
            this.customIconsLoaderService.load();
        }

        this.appManager.beforeAppReady();

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
                this.spinner.arialabel = data.messages.toString();
            });
        });

        // set theme to bs3 on ngx-bootstrap. This avoids runtime calculation to determine bs theme. Thus resolves performance.
        setTheme('bs3');

        let spinnerId;

        let onPageRendered = noop;

        this.router.events.subscribe(e => {
            if (e instanceof NavigationStart) {
                let page = e.url.split('?')[0];
                page = page.substring(1);

                if (!page) {
                    this.app.activeLayoutName = '';
                    this.app.layoutPages = [];
                }
                if (this.app.activeLayoutName && this.app.layoutPages && this.app.layoutPages.length && this.app.layoutPages.includes(page)) {
                    spinnerId = this.spinnerService.show('', 'wmRouterOutlet', '', 'wmRouterOutlet');
                } else {
                    spinnerId = this.spinnerService.show('', 'globalSpinner');
                }

                const node = document.querySelector('app-page-outlet') as HTMLElement;
                if (node) {
                    addClass(node, 'page-load-in-progress');
                }

                const pageLoadStartTime = Date.now();
                onPageRendered = () => {
                    this.spinnerService.hide(spinnerId);
                    const node = document.querySelector('app-page-outlet') as HTMLElement;
                    if (node) {
                        removeClass(node, 'page-load-in-progress');
                    }
                    onPageRendered = noop;
                    this.app.activePageLoadTime = Date.now() - pageLoadStartTime;
                };
            } else if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
                setTimeout(() => {
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
        //to fix the issue that happens only in the development mode
        //ExpressionChangedAfterItHasBeenCheckedError
        //fix: https://blog.angular-university.io/angular-debugging/
        setTimeout(() => {
            this.startApp = true;
        });
        setTimeout(() => {
            this.app.dynamicComponentContainerRef = this.dynamicComponentContainerRef;
            this.overrideRouterOutlet();
        }, 10);
    }

    private overrideRouterOutlet() {
        //override the attach/detach methods
        const oAttach = this.routerOutlet.attach;
        const oDetach = this.routerOutlet.detach;
        this.routerOutlet.attach = (componentRef: any, activatedRoute:  ActivatedRoute) => {
            oAttach.call(this.routerOutlet, componentRef, activatedRoute);
            componentRef.instance.ngOnAttach();
        };
        this.routerOutlet.detach = () => {
            this.app.activePage.ngOnDetach();
            const componentRef = oDetach.call(this.routerOutlet);
            return componentRef;
        };
    }

    ngAfterViewInit() {
        document.documentElement.setAttribute('lang', getWmProjectProperties().defaultLanguage);
            this.start();
    }

    ngDoCheck() {
        $invokeWatchers();
    }
}
