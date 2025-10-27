import {
    AfterViewInit,
    Injector,
    OnDestroy,
    ViewChild,
    Directive,
    inject
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';

import {
    $invokeWatchers,
    AbstractI18nService,
    AbstractNavigationService,
    App,
    noop,
    Viewport,
    ScriptLoaderService,
    UtilsService,
    registerFnByExpr
} from '@wm/core';
import { PartialDirective, WidgetRef} from '@wm/components/base';
import { PageDirective, SpaPageDirective } from '@wm/components/page';
import {PrefabDirective} from '@wm/components/prefab';
import { VariablesService } from '@wm/variables';

import { FragmentMonitor } from '../util/fragment-monitor';
import { AppManagerService } from '../services/app.manager.service';
import {each} from "lodash-es";

export const commonPartialWidgets = {};

@Directive()
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
    pageDirective: PageDirective | SpaPageDirective;
    Prefab: PrefabDirective;
    scriptLoaderService: ScriptLoaderService;
    Viewport: Viewport;
    compileContent = false;
    spa: boolean;

    destroy$ = new Subject();
    viewInit$ = new Subject();
    private viewParent: any;

    abstract evalUserScript(prefabContext: any, appContext: any, utils: any);

    abstract getVariables();
    abstract getExpressions();

    getContainerWidgetInjector() {
        return this.containerWidget.inj || this.containerWidget.injector;
    }

    init() {

        this.App = this.injector ? this.injector.get(App) : inject(App);
        //making the code compatible in both the JIT and AOT modes
        this.containerWidget = this.injector ? this.injector.get(WidgetRef) : inject(WidgetRef);
        this.i18nService = this.injector ? this.injector.get(AbstractI18nService) : inject(AbstractI18nService);
        this.scriptLoaderService = this.injector ? this.injector.get(ScriptLoaderService) : inject(ScriptLoaderService);
        this.Viewport = this.injector ? this.injector.get(Viewport) : inject(Viewport);
        // this.viewContainerRef = this.getContainerWidgetInjector().get(ViewContainerRef);
        // Replacing this.getContainerWidgetInjector().view.component as viewParent
        // this.viewParent = (this.viewContainerRef as any).parentInjector._lView[8];
        this.viewParent = this.containerWidget.viewParent;

        if (this.viewParent.registerFragment) {
            this.viewParent.registerFragment();
        }

        // register functions for binding evaluation
        this.registerExpressions();
        this.initUserScript();

        this.registerWidgets();
        this.initVariables();

        this.activePageName = this.App.activePageName; // Todo: remove this
        this.registerPageParams();

        this.defineI18nProps();

        this.viewInit$.subscribe(noop, noop, () => {
            this.pageParams = this.containerWidget.partialParams;
        });

        if (this.spa) {
            // Resolve optionally because Common/app-level partials can initialize before a page exists
            this.pageDirective = this.injector ? this.injector.get(SpaPageDirective, null) : (inject as any)(SpaPageDirective, { optional: true });
        } else {
            this.pageDirective = this.injector ? this.injector.get(PageDirective, null) : (inject as any)(PageDirective, { optional: true });
        }
        if (this.pageDirective) {
            this.registerDestroyListener(this.pageDirective.subscribe('attach', data => this.ngOnAttach(data.refreshData)));
            this.registerDestroyListener(this.pageDirective.subscribe('detach', () => this.ngOnDetach()));
        }

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
            // partials inside prefab should have access to Prefab properties and events
            if (this.viewParent.prefabName) {
                // for partial within partial within prefabs, just assign the parent partial's prefab object
                if (this.viewParent.Prefab) {
                    this.Prefab = this.viewParent.Prefab;
                } else {
                    this.Prefab = this.viewParent;
                }
            }
            this.evalUserScript(this, this.App, this.injector ? this.injector.get(UtilsService) : inject(UtilsService));
        } catch (e) {
            console.error(`Error in evaluating partial (${this.partialName}) script\n`, e);
        }
    }

    initVariables() {
        const variablesService = this.injector ? this.injector.get(VariablesService) : inject(VariablesService);

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

    /**
     * function to register bind expressions generated in this partial instance
     * getExpressions function is defined in the generated page.comp.ts file
     * @param expressions, map of bind expression vs generated function
     */
    registerExpressions() {
        const expressions = this.getExpressions();
        each(expressions, (fn, expr) => {
            registerFnByExpr(expr, fn[0], fn[1]);
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
        if (this.viewParent.resolveFragment) {
            this.viewParent.resolveFragment();
        }
    }

    private loadScripts() {
        return new Promise<void>((resolve) => {
            const scriptsRequired = this.partialDirective?.$element.attr('scripts-to-load');
            if (scriptsRequired) {
                this.scriptLoaderService
                    .load(...scriptsRequired.split(','))
                    .then(resolve);
            } else {
                resolve();
            }
        });
    }

    mute() {
        const m = o => { o && o.mute && o.mute(); };
        each(this.Widgets, m);
        each(this.Variables, m);
        each(this.Actions, m);
    }

    unmute() {
        const um = o => { o && o.unmute && o.unmute(); };
        each(this.Widgets, um);
        each(this.Variables, um);
        each(this.Actions, um);
    }

    // ngOnInit() {
    //     this.init();
    // }

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
        // Call ngOnDetach to ensure cleanup if it hasn't been called
        if (this.Widgets) {
            this.ngOnDetach();
        }
        
        this.destroy$.complete();
        // Complete all subjects to prevent memory leaks
        if (this.viewInit$ && !this.viewInit$.closed) {
            this.viewInit$.complete();
        }
        if (this.fragmentsLoaded$ && !this.fragmentsLoaded$.closed) {
            this.fragmentsLoaded$.complete();
        }
        
        // Clear references to prevent memory leaks
        this.Widgets = null;
        this.Variables = null;
        this.Actions = null;
        this.viewParent = null;
        this.containerWidget = null;
    }

    ngOnAttach(refreshData) {
        this.unmute();
        if (refreshData) {
            const refresh = v => { v && v.startUpdate && v.invoke && v.invoke(); };
            each(this.Variables, refresh);
            each(this.Actions, refresh);
        }
        each(this.Widgets, w => w && w.ngOnAttach && w.ngOnAttach());
    }

    ngOnDetach() {
        this.mute();
        each(this.Widgets, w => w && w.ngOnDetach && w.ngOnDetach());
        
        // Clear circular references to allow garbage collection
        // Partials can hold references that prevent parent pages from being freed
        if (this.viewParent && this.viewParent.unregisterFragment) {
            this.viewParent.unregisterFragment();
        }
    }

    onReady(params?) {
    }
}
