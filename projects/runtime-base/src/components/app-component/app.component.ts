import {CommonModule} from '@angular/common';
import {AlertDialogComponent} from '@wm/components/dialogs/alert-dialog';
import {ConfirmDialogComponent} from '@wm/components/dialogs/confirm-dialog';
import {
    AfterViewInit,
    ApplicationRef,
    Component,
    DoCheck,
    ElementRef,
    NgZone,
    OnDestroy,
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

import {setTheme} from 'ngx-bootstrap/utils';

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
import { ContainerDirective, PartialContainerDirective, PartialParamHandlerDirective } from '@wm/components/base';
import { OAuthService } from '@wm/oAuth';
import { AppManagerService } from '../../services/app.manager.service';
import { PipeProvider } from '../../services/pipe-provider.service';
import { ComponentRefProvider } from '../../types/types';
import { AppSpinnerComponent } from '../app-spinner.component';
import { DialogComponent } from '@wm/components/dialogs/design-dialog';
import { filter } from "rxjs/operators";
import { Subscription}  from "rxjs";

// Extend window interface for gc() function (available when Chrome runs with --js-flags=--expose-gc)
declare global {
    interface Window {
        gc?: () => void;
    }
}

interface SPINNER {
    show: boolean;
    messages: Array<string>;
    arialabel: string;
}
@Component({
    standalone: true,
    imports: [CommonModule, RouterOutlet, AlertDialogComponent, ConfirmDialogComponent, DialogComponent, AppSpinnerComponent, ContainerDirective, PartialParamHandlerDirective , PartialContainerDirective],
    selector: 'app-root',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements DoCheck, AfterViewInit, OnDestroy {
    public startApp = false;
    public isApplicationType = false;
    public enableSkipToMainContent = getWmProjectProperties().enableSkipToMainContent === 'true' || getWmProjectProperties().enableSkipToMainContent === true;
    private retryCount = 0;
    private navigationEndSubscription!: Subscription;
    private routerEventsSubscription!: Subscription;
    private oAuthSubscription!: Subscription;
    private spinnerSubscription!: Subscription;
    private pageReadyUnsubscribe: () => void;
    private pageAttachUnsubscribe: () => void;
    appLocale: any = {};

    @ViewChild(RouterOutlet) routerOutlet: RouterOutlet;

    @ViewChild('dynamicComponent', { read: ViewContainerRef }) dynamicComponentContainerRef: ViewContainerRef;

    spinner: SPINNER = { show: false, messages: [], arialabel: '' };
    private navigationCount = 0;
    
    constructor(
        _pipeProvider: PipeProvider,
        _appRef: ApplicationRef,
        private elRef: ElementRef,
        private oAuthService: OAuthService,
        private dialogService: AbstractDialogService,
        private spinnerService: AbstractSpinnerService,
        ngZone: NgZone,
        private router: Router,
        public app: App,
        private appManager: AppManagerService,
        private customIconsLoaderService: CustomIconsLoaderService,
        private componentRefProvider: ComponentRefProvider
    ) {
        setPipeProvider(_pipeProvider);
        setNgZone(ngZone);
        setAppRef(_appRef);

        this.appLocale = app.appLocale;
        this.isApplicationType = getWmProjectProperties().type === 'APPLICATION';
        if (this.isApplicationType) {
            this.customIconsLoaderService.load();
        }

        // subscribe to OAuth changes
        this.oAuthSubscription = oAuthService.getOAuthProvidersAsObservable().subscribe((providers: any) => {
            this.providersConfig = providers;
            if (providers.length) {
                this.showOAuthDialog();
            } else {
                this.closeOAuthDialog();
            }
        });

        // Subscribe to the message source to show/hide app spinner
        this.spinnerSubscription = this.spinnerService.getMessageSource().asObservable().subscribe((data: any) => {
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

        // Store router events subscription to prevent memory leak
        this.routerEventsSubscription = this.router.events.subscribe(e => {
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
                // CRITICAL FIX: Clear cache IMMEDIATELY, not after 1 second delay
                // The old 1-second delay meant the new page loaded and cached BEFORE old cache was cleared
                // This caused continuous memory growth as both old and new pages remained in cache
                onPageRendered();
                
                this.navigationCount++;
                
                // Clear cache after every navigation to prevent memory buildup
                if (this.navigationCount > 0 && this.componentRefProvider) {
                    try {
                        // clearComponentFactoryRefCache clears:
                        // 1. fragmentCache (stores page/partial/prefab resources)
                        // 2. componentFactoryRefCache (stores compiled component factories)
                        // 3. scriptCache (stores compiled page scripts)
                        // These caches were causing the 160 MB array retention seen in heap snapshots
                        this.componentRefProvider.clearComponentFactoryRefCache();
                        
                        // Trigger garbage collection if available (Chrome with --js-flags=--expose-gc)
                        if (window.gc && typeof window.gc === 'function') {
                            setTimeout(() => {
                                try {
                                    window.gc();
                                } catch (e) {
                                    // GC not available
                                }
                            }, 100);
                        }
                    } catch (e) {
                        console.warn('Failed to clear component cache:', e);
                    }
                }
            }
        });
        this.pageReadyUnsubscribe = this.appManager.subscribe('pageReady', () => {
            onPageRendered();
        });
        this.pageAttachUnsubscribe = this.appManager.subscribe('pageAttach', () => {
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

    skipToAppContent(event: Event): void {
        event.preventDefault();
        this.retryCount = 0;
        this.tryFocusContent();
    }

    private tryFocusContent(): void {
        const contentEl = document.querySelector('.app-page-content') as HTMLElement;

        if (contentEl) {
            contentEl.setAttribute('tabindex', '-1'); // Ensure it's focusable
            contentEl.focus({ preventScroll: false });
            contentEl.scrollIntoView({ behavior: 'smooth' });
        } else if (this.retryCount < 10) {
            this.retryCount++;
            setTimeout(() => this.tryFocusContent(), 100); // Retry every 100ms
        }
    }

    ngAfterViewInit() {
        document.documentElement.setAttribute('lang', getWmProjectProperties().defaultLanguage);
        this.start();

        if (this.enableSkipToMainContent) {
           this.navigationEndSubscription = this.router.events
                .pipe(filter((e) => e instanceof NavigationEnd))
                .subscribe(() => {
                    const el = document.getElementById('app-focus-start');
                    if (el) {
                        el.focus();
                    }
                });
        }
    }

    ngDoCheck() {
        $invokeWatchers();
    }

    ngOnDestroy() {
        // Unsubscribe from all subscriptions to prevent memory leaks
        if (this.navigationEndSubscription){
            this.navigationEndSubscription.unsubscribe();
        }
        if (this.routerEventsSubscription) {
            this.routerEventsSubscription.unsubscribe();
        }
        if (this.oAuthSubscription) {
            this.oAuthSubscription.unsubscribe();
        }
        if (this.spinnerSubscription) {
            this.spinnerSubscription.unsubscribe();
        }
        if (this.pageReadyUnsubscribe) {
            this.pageReadyUnsubscribe();
        }
        if (this.pageAttachUnsubscribe) {
            this.pageAttachUnsubscribe();
        }
    }
}
