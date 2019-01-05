import { AfterViewInit, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Subject } from 'rxjs';

import {
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

    destroy$ = new Subject();
    viewInit$ = new Subject();

    abstract evalUserScript(prefabContext: any, appContext: any, utils: any);
    abstract getVariables();

    init() {
        console.log('inside base page component', this.pageName);

        muteWatchers();

        this.App = this.injector.get(App);
        this.route = this.injector.get(ActivatedRoute);
        this.appManager = this.injector.get(AppManagerService);
        this.navigationService = this.injector.get(AbstractNavigationService);
        this.router = this.injector.get(Router);

        this.initUserScript();

        this.registerWidgets();
        this.initVariables();

        this.App.lastActivePageName = this.App.activePageName;
        this.App.activePageName = this.pageName;
        this.App.activePage = this;
        this.activePageName = this.pageName; // Todo: remove this

        this.registerPageParams();

        this.router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                const node = document.querySelector('app-page-outlet') as HTMLElement;
                if (node) {
                    addClass(node, 'page-load-in-progress');
                }
            }
        });

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
            console.warn(`Error in evaluating page(${this.pageName}) script`, e);
        }
    }

    registerPageParams() {
        const subscription = this.route.queryParams.subscribe(params => this.pageParams = params);
        this.registerDestroyListener(() => subscription.unsubscribe());
    }

    registerDestroyListener(fn: Function) {
        this.destroy$.subscribe(noop, noop, () => fn());
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

                this.appManager.isAppVariablesFired(true);
            }

            variableCollection.callback(variableCollection.Variables)
                .catch(noop)
                .then(() => {
                    this.appManager.notify('page-start-up-variables-loaded', {pageName: this.pageName});
                });
            variableCollection.callback(variableCollection.Actions);

            subscription.unsubscribe();
        });
    }

    runPageTransition($target: HTMLElement): Promise<void> {
        return new Promise(resolve => {
            let transition = this.navigationService.getPageTransition();
            if (transition) {
                const onTransitionEnd = () => {
                    if (resolve) {
                        $target.removeEventListener('animationend', onTransitionEnd);
                        removeClass($target, transition);
                        resolve();
                        resolve = null;
                    }
                };
                transition = 'page-transition page-transition-' + transition;
                addClass($target, transition);
                $target.addEventListener('animationend', onTransitionEnd);
                // Wait for a maximum of 1 second for transition to end.
                setTimeout(onTransitionEnd, 1000);
            } else {
                resolve();
            }
        });
    }

    invokeOnReady() {
        setTimeout(() => {
            const node = document.querySelector('app-page-outlet') as HTMLElement;
            if (node) {
                removeClass(node, 'page-load-in-progress');
            }
        });
        this.onReady();
        (this.App.onPageReady || noop)(this.pageName, this);
        this.appManager.notify('pageReady', {'name' : this.pageName, instance: this});
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            unMuteWatchers();
            this.viewInit$.complete();
            if (isMobileApp()) {
                this.onPageContentReady = () => {
                    this.invokeOnReady();
                    this.onPageContentReady = noop;
                    setTimeout(() => this.showPageContent = true);
                };
            } else {
                this.fragmentsLoaded$.subscribe(noop, noop, () => this.invokeOnReady());
            }
        }, 300);
    }

    ngOnDestroy(): void {
        this.destroy$.complete();
    }

    onReady() {}

    onPageContentReady() {}
}
