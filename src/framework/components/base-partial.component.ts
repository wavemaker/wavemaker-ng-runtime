import { AfterViewInit, Injector, OnDestroy } from '@angular/core';
import { FragmentMonitor } from '../util/fragment-monitor';
import { AbstractNavigationService, App, noop, triggerFn, UtilsService } from '@wm/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppManagerService } from '../services/app.manager.service';
import { Subject } from 'rxjs';
import { commonPartialWidgets } from '../util/page-util';
import { WidgetRef } from '@wm/components';
import { VariablesService } from '@wm/variables';

export abstract class BasePartialComponent extends FragmentMonitor implements AfterViewInit, OnDestroy {
    Widgets: any;
    Variables: any;
    Actions: any;
    App: App;
    injector: Injector;
    partialName: string;
    activePageName: string;
    route: ActivatedRoute;
    appManager: AppManagerService;
    navigationService: AbstractNavigationService;
    router: Router;
    pageParams: any;
    containerWidget: any;

    destroy$ = new Subject();
    viewInit$ = new Subject();

    abstract evalUserScript(prefabContext: any, appContext: any, utils: any);

    abstract getVariables();

    getContainerWidgetInjector() {
        return this.containerWidget.inj || this.containerWidget.injector;
    }

    init() {
        console.log('base partial');

        this.App = this.injector.get(App);
        this.containerWidget = this.injector.get(WidgetRef);
        this.getContainerWidgetInjector().view.component.registerFragment();

        this.initUserScript();

        this.registerWidgets();
        this.initVariables();

        this.activePageName = this.App.activePageName; // Todo: remove this
        this.registerPageParams();

        this.viewInit$.subscribe(noop, noop, () => {
            this.pageParams = this.containerWidget.partialParams;
        });

        super.init();
    }

    registerWidgets() {
        if (this.partialName === 'Common') {
            this.Widgets = commonPartialWidgets;
        } else {
            this.Widgets = Object.create(commonPartialWidgets);
        }
    }

    initUserScript() {
        try {
            this.evalUserScript(this, this.App, this.injector.get(UtilsService));
        } catch (e) {
            console.warn(`Error in evaluating page(${this.partialName}) script`, e);
        }
    }

    initVariables() {
        const variablesService = this.injector.get(VariablesService);

        // get variables and actions instances for the page
        const variableCollection = variablesService.register(this.partialName, this.getVariables(), this);

        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = {};
        this.Actions = {};

        this.containerWidget.Variables = this.Variables;
        this.containerWidget.Actions = this.Actions;

        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(([name, variable]) => this.Variables[name] = variable);
        Object.entries(variableCollection.Actions).forEach(([name, action]) => this.Actions[name] = action);


        this.viewInit$.subscribe(noop, noop, () => {
            variableCollection.callback(variableCollection.Variables);
            variableCollection.callback(variableCollection.Actions);
        });
    }

    registerPageParams() {
        this.pageParams = this.containerWidget.partialParams;
    }

    invokeOnReady() {
        this.onReady();
        this.getContainerWidgetInjector().view.component.resolveFragment();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.viewInit$.complete();

            this.fragmentsLoaded$.subscribe(noop, noop, () => this.invokeOnReady());

        }, 100);
    }

    ngOnDestroy(): void {
        this.destroy$.complete();
    }

    onReady() {
    }
}
