import { AfterViewInit, Injector, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { AbstractI18nService, AbstractNavigationService, App, noop, ScriptLoaderService, UtilsService } from '@wm/core';
import { PartialDirective, WidgetRef} from '@wm/components/base';
import { VariablesService } from '@wm/variables';

import { FragmentMonitor } from '../util/fragment-monitor';
import { AppManagerService } from '../services/app.manager.service';
import { $invokeWatchers } from '@wm/core';

export const commonPartialWidgets = {};

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
    i18nService: AbstractI18nService;
    appLocale: any;
    @ViewChild(PartialDirective) partialDirective;
    scriptLoaderService: ScriptLoaderService;
    compileContent = false;

    destroy$ = new Subject();
    viewInit$ = new Subject();

    abstract evalUserScript(prefabContext: any, appContext: any, utils: any);

    abstract getVariables();

    getContainerWidgetInjector() {
        return this.containerWidget.inj || this.containerWidget.injector;
    }

    init() {

        this.App = this.injector.get(App);
        this.containerWidget = this.injector.get(WidgetRef);
        this.i18nService = this.injector.get(AbstractI18nService);
        this.scriptLoaderService = this.injector.get(ScriptLoaderService);
        if (this.getContainerWidgetInjector().view.component.registerFragment) {
            this.getContainerWidgetInjector().view.component.registerFragment();
        }

        this.initUserScript();

        this.registerWidgets();
        this.initVariables();

        this.activePageName = this.App.activePageName; // Todo: remove this
        this.registerPageParams();

        this.defineI18nProps();

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

        this.containerWidget.Widgets = this.Widgets;
    }

    registerDestroyListener(fn: Function) {
        this.destroy$.subscribe(noop, noop, () => fn());
    }

    initUserScript() {
        try {
            this.evalUserScript(this, this.App, this.injector.get(UtilsService));
        } catch (e) {
            console.error(`Error in evaluating partial (${this.partialName}) script\n`, e);
        }
    }

    initVariables() {
        const variablesService = this.injector.get(VariablesService);

        // get variables and actions instances for the page
        const variableCollection = variablesService.register(this.partialName, this.getVariables(), this);

        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = Object.create(this.App.Variables);
        this.Actions = Object.create(this.App.Actions);

        this.containerWidget.Variables = this.Variables;
        this.containerWidget.Actions = this.Actions;

        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(([name, variable]) => this.Variables[name] = variable);
        Object.entries(variableCollection.Actions).forEach(([name, action]) => this.Actions[name] = action);


        this.viewInit$.subscribe(noop, noop, () => {
            // TEMP: triggering watchers so variables watching over params are updated
            $invokeWatchers(true, true);
            variableCollection.callback(variableCollection.Variables).catch(noop);
            variableCollection.callback(variableCollection.Actions);
        });
    }

    registerPageParams() {
        this.pageParams = this.containerWidget.partialParams;
    }

    defineI18nProps() {
        this.appLocale = this.i18nService.getAppLocale();
    }

    invokeOnReady() {
        let params;
        if (this.containerWidget.userComponentParams) {
            params = this.containerWidget.userComponentParams;
        }
        this.onReady(params);
        if (this.getContainerWidgetInjector().view.component.resolveFragment) {
            this.getContainerWidgetInjector().view.component.resolveFragment();
        }
    }

    private loadScripts() {
        return new Promise((resolve) => {
            const scriptsRequired = this.partialDirective.$element.attr('scripts-to-load');
            if (scriptsRequired) {
                this.scriptLoaderService
                    .load(...scriptsRequired.split(','))
                    .then(resolve);
            } else {
                resolve();
            }
        });
    }

    ngAfterViewInit(): void {
        this.loadScripts().then(() => {
            this.compileContent = true;
            setTimeout(() => {
                this.viewInit$.complete();

                this.fragmentsLoaded$.subscribe(noop, noop, () => this.invokeOnReady());

            }, 100);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.complete();
    }

    onReady(params?) {
    }
}
