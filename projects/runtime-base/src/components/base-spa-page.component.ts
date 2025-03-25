import { AfterViewInit, HostListener, Injector, OnDestroy, ViewChild, Directive, AfterContentInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { isAndroid, isIos, Viewport, ScriptLoaderService, registerFnByExpr } from '@wm/core';
import { LayoutDirective, SpaPageDirective } from '@wm/components/page';

import {Subject, Subscription} from 'rxjs';

import {
    AbstractI18nService,
    AbstractNavigationService,
    addClass,
    App,
    isMobileApp,
    muteWatchers,
    noop,
    removeClass,
    unMuteWatchers,
    UtilsService
} from '@wm/core';
import { commonPartialWidgets } from './base-partial.component';


import { VariablesService } from '@wm/variables';
import { AppManagerService } from '../services/app.manager.service';
import { FragmentMonitor } from '../util/fragment-monitor';
import { CACHE_PAGE } from '../util/wm-route-reuse-strategy';
import {each, extend} from "lodash-es";

declare const $;

@Directive()
export abstract class BaseSpaPageComponent extends FragmentMonitor implements AfterViewInit, OnDestroy, AfterContentInit {
    static lastPageSnapShot = null;
    Widgets: any;
    Variables: any;
    Actions: any;
    App: App;
    injector: Injector;
    pageName: string;
    activePageName: string;
    route: ActivatedRoute;
    appManager: AppManagerService;
    navigationService: AbstractNavigationService;
    router: Router;
    pageParams: any;
    showPageContent: boolean;
    i18nService: AbstractI18nService;
    appLocale: any;
    startupVariablesLoaded = false;
    pageTransitionCompleted = false;
    layoutDirective: LayoutDirective;
    @ViewChild(SpaPageDirective) spaPageDirective;
    $page;
    scriptLoaderService: ScriptLoaderService;
    Viewport: Viewport;

    destroy$ = new Subject();
    viewInit$ = new Subject();
    formatsByLocale = {'timezone': ''};

    abstract evalUserScript(prefabContext: any, appContext: any, utils: any);
    abstract getVariables();
    abstract getExpressions();

    init() {

        muteWatchers();

        this.App = this.injector ? this.injector.get(App) : inject(App);
        this.route = this.injector ? this.injector.get(ActivatedRoute) : inject(ActivatedRoute);
        this.appManager = this.injector ? this.injector.get(AppManagerService) : inject(AppManagerService);
        this.navigationService = this.injector ? this.injector.get(AbstractNavigationService) : inject(AbstractNavigationService);
        this.scriptLoaderService = this.injector ? this.injector.get(ScriptLoaderService) : inject(ScriptLoaderService);
        this.i18nService = this.injector ? this.injector.get(AbstractI18nService) : inject(AbstractI18nService);
        this.router = this.injector ? this.injector.get(Router) : inject(Router);
        this.Viewport = this.injector ? this.injector.get(Viewport) : inject(Viewport);
        this.layoutDirective = this.injector ? this.injector.get(LayoutDirective) : inject(LayoutDirective);

        // register functions for binding evaluation
        this.registerExpressions();
        this.initUserScript();

        this.registerWidgets();
        this.initVariables();

        this.App.lastActivePageName = this.App.activePageName;
        this.App.activePageName = this.pageName;
        this.App.activePage = this;
        this.activePageName = this.pageName; // Todo: remove this

        this.registerPageParams();
        this.defineI18nProps();
        super.init();
    }

    registerWidgets() {
        // common partial widgets should be accessible from page
        this.Widgets = Object.create(commonPartialWidgets);

        // expose current page widgets on app
        (this.App as any).Widgets = Object.create(this.Widgets);
    }

    initUserScript() {
        try {
            this.evalUserScript(this, this.App, this.injector ? this.injector.get(UtilsService) : inject(UtilsService));
        } catch (e) {
            console.error(`Error in evaluating page (${this.pageName}) script\n`, e);
        }
    }

    registerPageParams() {
        const subscription = this.route.queryParams.subscribe(params => this.pageParams = (this.App as any).pageParams = extend({}, params));
        this.registerDestroyListener(() => subscription.unsubscribe());
    }

    registerDestroyListener(fn: Function) {
        this.destroy$.subscribe(noop, noop, () => fn());
    }

    defineI18nProps() {
        this.appLocale = this.i18nService.getAppLocale();
    }

    initVariables() {
        const variablesService = this.injector ? this.injector.get(VariablesService) : inject(VariablesService);

        // get variables and actions instances for the page
        const variableCollection = variablesService.register(this.pageName, this.getVariables(), this);

        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = Object.create(this.App.Variables);
        this.Actions = Object.create(this.App.Actions);

        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(([name, variable]) => this.Variables[name] = variable);
        Object.entries(variableCollection.Actions).forEach(([name, action]) => this.Actions[name] = action);



        const subscription = this.viewInit$.subscribe(noop, noop, () => {

            if (!this.appManager.isAppVariablesFired()) {
                variableCollection.callback(this.App.Variables).catch(noop).then(() => {
                    this.appManager.notify('app-variables-data-loaded', {pageName: this.pageName});
                });
                variableCollection.callback(this.App.Actions);
                this.appManager.appVariablesReady();
                this.appManager.isAppVariablesFired(true);
            }

            variableCollection.callback(variableCollection.Variables)
                .catch(noop)
                .then(() => {
                    this.appManager.notify('page-variables-data-loaded', {pageName: this.pageName});
                    this.startupVariablesLoaded = true;
                    // hide the loader only after the some setTimeout for smooth page load.
                    setTimeout(() => {
                        this.showPageContent = true;
                    }, 100);
                });
            variableCollection.callback(variableCollection.Actions);

            subscription.unsubscribe();
        });
    }

    setTimezone(locale) {
        this.i18nService.setTimezone(locale, this);
    }

    /**
     * function to register bind expressions generated in this page instance
     * getExpressions function is defined in the generated page.comp.ts file
     * @param expressions, map of bind expression vs generated function
     */
    registerExpressions() {
        const expressions = this.getExpressions();
        each(expressions, (fn, expr) => {
            registerFnByExpr(expr, fn[0], fn[1]);
        });
    }

    runPageTransition(transition?: string): Promise<void> {
        transition = transition || this.navigationService.getPageTransition();
        const lastPage = BaseSpaPageComponent.lastPageSnapShot
        return new Promise<void>(resolve => {
            if (transition
                && !transition.startsWith('none')
                && lastPage) {
                const $target = lastPage.parent();
                const onTransitionEnd = (e) => {
                    if (resolve && !(e && e.pseudoElement)) {
                        $target.off('animationend', onTransitionEnd);
                        $target.removeClass(transition);
                        $target.children().first().remove();
                        resolve();
                        resolve = null;
                    }
                };
                transition = 'page-transition page-transition-' + transition;
                lastPage.addClass('page-exit');
                this.$page.addClass('page-entry');
                $target.addClass(transition);
                $target.on('animationend', onTransitionEnd);
                // Wait for a maximum of 1 second for transition to end.
                setTimeout(onTransitionEnd, 1000);
            } else {
                resolve();
            }
        }).then(() => {
            this.$page && this.$page.removeClass('page-entry');
            if (lastPage) {
                lastPage.remove();
                BaseSpaPageComponent.lastPageSnapShot = null;
            }
            this.pageTransitionCompleted = true;
        });
    }

    invokeOnReady() {
        this.onReady();
        this.appManager.notify('highlightActiveLink', {'pageName' : this.pageName});
        this.appManager.notify('pageReady', {'name' : this.pageName, instance: this});
        (this.App.onPageReady || noop)(this.pageName, this);
    }

    private loadScripts() {
        return new Promise<void>((resolve) => {
            const scriptsRequired = this.spaPageDirective && this.spaPageDirective.$element.attr('scripts-to-load');

            if (scriptsRequired) {
                this.scriptLoaderService
                    .load(...scriptsRequired.split(','))
                    .then(resolve);
            } else {
                resolve();
            }
        });
    }

    private restoreLastPageSnapshot() {
        if (isMobileApp() && BaseSpaPageComponent.lastPageSnapShot && this.$page) {
            this.$page.parent().prepend(BaseSpaPageComponent.lastPageSnapShot);
        }
    }

    private savePageSnapShot() {
        if (BaseSpaPageComponent.lastPageSnapShot) {
            BaseSpaPageComponent.lastPageSnapShot.remove();
        }
        if (isMobileApp() && this.$page) {
            BaseSpaPageComponent.lastPageSnapShot = this.$page.clone();
            this.$page.parents('app-root').prepend(BaseSpaPageComponent.lastPageSnapShot);
        }
    }

    private saveScrollPosition() {
        const fn = ($el, key, recursive = true, $target = $el)  => {
            if (recursive) {
                $el.children().each((i, v) => fn($(v), key));
            }
            const scrollData = {
                x: $target.scrollLeft(),
                y: $target.scrollTop()
            };
            if(scrollData.x > 0 || scrollData.y > 0) {
                $el.attr(key, scrollData.x + ',' + scrollData.y);
            }
        };
        fn(this.$page, 'data-scroll-position');
        this.$page.attr('data-window-scroll-position', window.scrollX + ',' + window.scrollY);
    }

    private restoreScrollPosition() {
        const fn = ($el, key, recursive  = true, $target = $el) => {
            const scrollData = ($el.attr(key) || '').split(',');
            if(scrollData.length > 1) {
                $target.scrollLeft(scrollData[0]);
                $target.scrollTop(scrollData[1]);
            }
            $el.removeAttr(key);
            if (recursive) {
                $el.children().each((i, v) => fn($(v), key));
            }
        };
        fn(this.$page, 'data-scroll-position');
        fn(this.$page, 'data-window-scroll-position', false, $(window));
    }

    /**
     * canDeactivate is called before a route change.
     * This will internally call onBeforePageLeave method present
     * at page level and app level in the application and decide
     * whether to change route or not based on return value.
     */
    @HostListener('window:beforeunload')
    canDeactivate(nextState?: string){
        let retVal;
        // Calling onBeforePageLeave method present at page level
        retVal = this.onBeforePageLeave();
        // Calling onBeforePageLeave method present at app level only if page level method return true
        // or if there is no page level method
        if (retVal !== false ) {
            retVal =  (this.App.onBeforePageLeave || noop)(this.App.activePageName, this.App.activePage, nextState);
        }
        return retVal === undefined ? true : retVal;
    }

    ngAfterViewInit(): void {
        this.route.snapshot.data[CACHE_PAGE] = this.canReuse();
        if (this.layoutDirective) {
            this.$page = this.layoutDirective.$element.parent();
            if (isIos()) {
                this.$page.addClass('ios-page');
            }
            if (isAndroid()) {
                this.$page.addClass('android-page');
            }
        }
        this.restoreLastPageSnapshot();
        this.loadScripts().then(() => {
            this.runPageTransition()
                .then(() => {
                    (this as any).compilePageContent = true;
                    setTimeout(() => {
                        this.onPageContentReady = () => {
                            this.fragmentsLoaded$.subscribe(noop, noop, () => {
                                this.invokeOnReady();
                            });
                            unMuteWatchers();
                            this.viewInit$.complete();
                            this.onPageContentReady = noop;
                        };
                    }, 0);
                });
        });
    }

    ngOnDestroy(): void {
        this.savePageSnapShot();
        this.destroy$.complete();
    }

    onReady() {}

    onBeforePageReady() {}

    onBeforePageLeave() {}

    onPageContentReady() {}

    canReuse() {
        return !!(this.spaPageDirective && this.spaPageDirective.cache);
    }

    mute() {
        const m = o => { o && o.mute && o.mute(); };
        each(this.Widgets, m);
        each(this.Variables, m);
        each(this.Actions, m);
    }

    unmute(c = this) {
        const um = o => { o && o.unmute && o.unmute(); };
        each(this.Widgets, um);
        each(this.Variables, um);
        each(this.Actions, um);
    }

    ngOnAttach() {
        this.route.snapshot.data[CACHE_PAGE] = this.canReuse();
        this.registerPageParams();
        this.App.lastActivePageName = this.App.activePageName;
        this.App.activePageName = this.pageName;
        this.App.activePage = this;
        this.activePageName = this.pageName;
        this.restoreLastPageSnapshot();
        this.unmute();
        // expose current page widgets on app
        (this.App as any).Widgets = Object.create(this.Widgets);
        if(this.spaPageDirective && this.spaPageDirective.refreshdataonattach) {
            const refresh = v => { v && v.startUpdate && v.invoke && v.invoke(); };
            each(this.Variables, refresh);
            each(this.Actions, refresh);
        }
        this.runPageTransition().then(() => {
            setTimeout(() => this.restoreScrollPosition(), 100);
            each(this.Widgets, w => w && w.ngOnAttach && w.ngOnAttach());
            this.appManager.notify('pageAttach', {'name' : this.pageName, instance: this});
        });
        this.appManager.notify('highlightActiveLink', {'pageName': this.pageName});
    }

    ngOnDetach() {
        this.saveScrollPosition();
        this.savePageSnapShot();
        this.mute();
        each(this.Widgets, w => w && w.ngOnDetach && w.ngOnDetach());
        this.appManager.notify('pageDetach', {'name' : this.pageName, instance: this});
    }

    ngAfterContentInit() {
        this.onBeforePageReady();
    }

    static clear() {
        if(BaseSpaPageComponent.lastPageSnapShot) {
            BaseSpaPageComponent.lastPageSnapShot.remove();
            BaseSpaPageComponent.lastPageSnapShot = null;
        }
    }
}
