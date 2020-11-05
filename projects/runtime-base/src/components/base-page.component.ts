import { AfterViewInit, HostListener, Injector, OnDestroy, ViewChild, Directive } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { isAndroid, isIos, Viewport, ScriptLoaderService } from '@wm/core';
import { PageDirective } from '@wm/components/page';

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

declare const $, _;

@Directive()
export abstract class BasePageComponent extends FragmentMonitor implements AfterViewInit, OnDestroy {
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
    @ViewChild(PageDirective) pageDirective;
    $page;
    scriptLoaderService: ScriptLoaderService;
    Viewport: Viewport;

    destroy$ = new Subject();
    viewInit$ = new Subject();

    abstract evalUserScript(prefabContext: any, appContext: any, utils: any);
    abstract getVariables();

    init() {

        muteWatchers();

        this.App = this.injector.get(App);
        this.route = this.injector.get(ActivatedRoute);
        this.appManager = this.injector.get(AppManagerService);
        this.navigationService = this.injector.get(AbstractNavigationService);
        this.scriptLoaderService = this.injector.get(ScriptLoaderService);
        this.i18nService = this.injector.get(AbstractI18nService);
        this.router = this.injector.get(Router);
        this.Viewport = this.injector.get(Viewport);

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
            this.evalUserScript(this, this.App, this.injector.get(UtilsService));
        } catch (e) {
            console.error(`Error in evaluating page (${this.pageName}) script\n`, e);
        }
    }

    registerPageParams() {
        const subscription = this.route.queryParams.subscribe(params => this.pageParams = (this.App as any).pageParams = _.extend({}, params));
        this.registerDestroyListener(() => subscription.unsubscribe());
    }

    registerDestroyListener(fn: Function) {
        this.destroy$.subscribe(noop, noop, () => fn());
    }

    defineI18nProps() {
        this.appLocale = this.i18nService.getAppLocale();
    }

    initVariables() {
        const variablesService = this.injector.get(VariablesService);

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

    runPageTransition(transition?: string): Promise<void> {
        transition = transition || this.navigationService.getPageTransition();
        const lastPage = BasePageComponent.lastPageSnapShot
        return new Promise(resolve => {
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
                BasePageComponent.lastPageSnapShot = null;
            }
            this.pageTransitionCompleted = true;
        });
    }

    invokeOnReady() {
        this.onReady();
        this.appManager.notify('pageReady', {'name' : this.pageName, instance: this});
        (this.App.onPageReady || noop)(this.pageName, this);
    }

    private loadScripts() {
        return new Promise((resolve) => {
            const scriptsRequired = this.pageDirective && this.pageDirective.$element.attr('scripts-to-load');
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
        if (BasePageComponent.lastPageSnapShot && this.$page) {
            this.$page.parent().prepend(BasePageComponent.lastPageSnapShot);
        }
    }

    private savePageSnapShot() {
        if (BasePageComponent.lastPageSnapShot) {
            BasePageComponent.lastPageSnapShot.remove();
        }
        if (this.$page) {
            BasePageComponent.lastPageSnapShot = this.$page.clone();
            this.$page.parents('app-root').prepend(BasePageComponent.lastPageSnapShot);
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
    canDeactivate() {
        let retVal;
        // Calling onBeforePageLeave method present at page level
        retVal = this.onBeforePageLeave();
        // Calling onBeforePageLeave method present at app level only if page level method return true
        // or if there is no page level method
        if (retVal !== false ) {
            retVal =  (this.App.onBeforePageLeave || noop)(this.App.activePageName, this.App.activePage);
        }
        return retVal === undefined ? true : retVal;
    }

    ngAfterViewInit(): void {
        this.route.snapshot.data['__wm_page_reuse'] = this.canReuse();
        if (this.pageDirective) {
            this.$page = this.pageDirective.$element.parent();
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

    onBeforePageLeave() {}

    onPageContentReady() {}

    canReuse() {
        return !!(this.pageDirective && this.pageDirective.cache);
    }

    mute() {
        const m = o => { o && o.mute && o.mute(); };
        _.each(this.Widgets, m);
        _.each(this.Variables, m);
        _.each(this.Actions, m);
    }

    unmute(c = this) {
        const um = o => { o && o.unmute && o.unmute(); };
        _.each(this.Widgets, um);
        _.each(this.Variables, um);
        _.each(this.Actions, um);
    }

    ngOnAttach() {
        this.route.snapshot.data['__wm_page_reuse'] = this.canReuse();
        this.registerPageParams();
        this.App.lastActivePageName = this.App.activePageName;
        this.App.activePageName = this.pageName;
        this.App.activePage = this;
        this.activePageName = this.pageName;
        this.restoreLastPageSnapshot();
        this.unmute();
        if(this.pageDirective && this.pageDirective.refreshdataonattach) {
            const refresh = v => { v.startUpdate && v.invoke && v.invoke(); };
            _.each(this.Variables, refresh);
            _.each(this.Actions, refresh);
        }
        this.runPageTransition().then(() => {
            setTimeout(() => this.restoreScrollPosition(), 100);
            _.each(this.Widgets, w => w.ngOnAttach && w.ngOnAttach());
            this.appManager.notify('pageAttach', {'name' : this.pageName, instance: this});
        });
    }

    ngOnDetach() {
        this.saveScrollPosition();
        this.savePageSnapShot();
        this.mute();
        _.each(this.Widgets, w => w.ngOnDetach && w.ngOnDetach());
        this.appManager.notify('pageDetach', {'name' : this.pageName, instance: this});
    }

    static clear() {
        if(BasePageComponent.lastPageSnapShot) {
            BasePageComponent.lastPageSnapShot.remove();
            BasePageComponent.lastPageSnapShot = null;
        }
    }
}
