import { AfterViewInit, HostListener, Injector, OnDestroy, ViewChild, Directive } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { isAndroid, isIos, ScriptLoaderService } from '@wm/core';
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
    pageTransitionTarget;

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

    runPageTransition(transition: string): Promise<void> {
        return new Promise(resolve => {
            if (transition && !transition.startsWith('none')) {
                this.getPageTransitionTarget();
                const $target = this.pageTransitionTarget.parent();
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
                this.pageTransitionTarget.addClass('page-exit');
                this.$page.addClass('page-entry');
                $target.addClass(transition);
                $target.on('animationend', onTransitionEnd);
                // Wait for a maximum of 1 second for transition to end.
                setTimeout(onTransitionEnd, 1000);
            } else {
                resolve();
            }
        }).then(() => {
            this.$page.removeClass('page-entry');
            if (this.pageTransitionTarget) {
                this.pageTransitionTarget.remove();
                this.pageTransitionTarget = null;
            }
            this.pageTransitionCompleted = true;
        });
    }

    invokeOnReady() {
        this.onReady();
        (this.App.onPageReady || noop)(this.pageName, this);
        this.appManager.notify('pageReady', {'name' : this.pageName, instance: this});
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


    private getPageTransitionTarget() {
        if (!this.pageTransitionTarget) {
            let pageOutlet = $('app-page-outlet').first();
            if (pageOutlet.length === 0) { 
                pageOutlet = $('div[data-role="pageContainer"]').first().parent();
            }
            this.pageTransitionTarget = BasePageComponent.lastPageSnapShot;
            BasePageComponent.lastPageSnapShot = null;
            pageOutlet.prepend(this.pageTransitionTarget);
        }
        return this.pageTransitionTarget;
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
        this.$page = this.pageDirective.$element.parent();
        if (isIos()) {
            this.$page.addClass('ios-page');
        }
        if (isAndroid()) {
            this.$page.addClass('android-page');
        }
        this.loadScripts().then(() => {
            const transition = this.navigationService.getPageTransition();
            this.runPageTransition(transition)
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
        BasePageComponent.lastPageSnapShot = this.$page.clone();
        this.destroy$.complete();
    }

    onReady() {}

    onBeforePageLeave() {}

    onPageContentReady() {}
}
