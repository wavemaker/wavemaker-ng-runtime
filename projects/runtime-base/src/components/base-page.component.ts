import { AfterViewInit, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Subject } from 'rxjs';

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

declare const $;

export abstract class BasePageComponent extends FragmentMonitor implements AfterViewInit, OnDestroy {
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
    fragmentObservable;
    pageTransitionCompleted = false;

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
        const subscription = this.route.queryParams.subscribe(params => this.pageParams = params);
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
                variableCollection.callback(this.App.Variables);
                variableCollection.callback(this.App.Actions);
                this.appManager.appVariablesReady();
                this.appManager.isAppVariablesFired(true);
            }

            variableCollection.callback(variableCollection.Variables)
                .catch(noop)
                .then(() => {
                    this.appManager.notify('page-start-up-variables-loaded', {pageName: this.pageName});
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
            const $target = $('app-page-outlet:first');
            if (transition) {
                const onTransitionEnd = () => {
                    if (resolve) {
                        $target.off('animationend', onTransitionEnd);
                        $target.removeClass(transition);
                        $target.children().first().remove();
                        resolve();
                        resolve = null;
                    }
                };
                transition = 'page-transition page-transition-' + transition;
                $target.addClass(transition);
                $target.on('animationend', onTransitionEnd);
                // Wait for a maximum of 1 second for transition to end.
                setTimeout(onTransitionEnd, 1000);
            } else {
                resolve();
            }
        });
    }

    invokeOnReady() {
        this.fragmentObservable = this.route.fragment.subscribe((fragmentVal) => {
            if (fragmentVal) {
                const view = fragmentVal.split('.');
                if (view.length === 2) {
                    const prefabName = view[0];
                    this.appManager.$navigationService.goToView(view[view.length - 1], {
                        'prefabName': prefabName,
                        }, undefined);
                } else {
                    const pageName = view.length === 3 ? view[0] : this.activePageName;
                    const containerName = view.length === 3 ? view[1] : undefined;
                    this.appManager.$navigationService.goToView(view[view.length - 1], {
                        'pageName': pageName,
                        'containerName': containerName
                    }, undefined);
                }
            }
        });
        this.onReady();
        (this.App.onPageReady || noop)(this.pageName, this);
        this.appManager.notify('pageReady', {'name' : this.pageName, instance: this});
    }

    ngAfterViewInit(): void {
        const transition = this.navigationService.getPageTransition();
        if (transition) {
            const pageOutlet = $('app-page-outlet:first');
            pageOutlet.prepend(pageOutlet.children().first().clone());
        }
        this.runPageTransition(transition).then(() => {
            this.pageTransitionCompleted = true;
            (this as any).compilePageContent = true;
        });
        setTimeout(() => {
            unMuteWatchers();
            this.viewInit$.complete();
            if (isMobileApp()) {
                this.onPageContentReady = () => {
                    this.fragmentsLoaded$.subscribe(noop, noop, () => {
                        this.invokeOnReady();
                    });
                    this.onPageContentReady = noop;
                };
            } else {
                this.fragmentsLoaded$.subscribe(noop, noop, () => this.invokeOnReady());
            }
        }, 300);
    }

    ngOnDestroy(): void {
        this.fragmentObservable.unsubscribe();
        this.destroy$.complete();
    }

    onReady() {}

    onBeforePageLeave() {}

    onPageContentReady() {}
}
