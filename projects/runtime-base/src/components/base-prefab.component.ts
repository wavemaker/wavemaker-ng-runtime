import { AfterViewInit, Injector, inject, OnDestroy, ViewChild, Directive } from '@angular/core';
import { Subject } from 'rxjs';

import {
    $watch,
    AbstractI18nService,
    App,
    isIE,
    noop,
    ScriptLoaderService,
    UtilsService,
    $invokeWatchers,
    Viewport,
    registerFnByExpr
} from '@wm/core';
import { WidgetRef} from '@wm/components/base';
import { PageDirective, SpaPageDirective } from '@wm/components/page';
import { PrefabContainerDirective } from '@wm/components/prefab';
import { VariablesService } from '@wm/variables';

import { PrefabManagerService } from '../services/prefab-manager.service';
import { FragmentMonitor } from '../util/fragment-monitor';
import {each, startsWith, trim} from "lodash-es";

@Directive()
export abstract class BasePrefabComponent extends FragmentMonitor implements AfterViewInit, OnDestroy {
    Widgets: any;
    Variables: any;
    Actions: any;
    App: App;
    injector: Injector;
    containerWidget: any;
    prefabMngr: PrefabManagerService;
    displayName: string;
    prefabName: string;
    i18nService: AbstractI18nService;
    appLocale: any;
    @ViewChild(PrefabContainerDirective) prefabContainerDirective;
    scriptLoaderService: ScriptLoaderService;
    compileContent = false;
    pageDirective: PageDirective | SpaPageDirective;
    Viewport: Viewport;
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
        this.App = this.injector.get(App);
        //making the code compatible in both the JIT and AOT modes
        this.containerWidget = this.injector ? this.injector.get(WidgetRef) : inject(WidgetRef);

        this.prefabMngr = this.injector ? this.injector.get(PrefabManagerService) : inject(PrefabManagerService);
        this.i18nService = this.injector ? this.injector.get(AbstractI18nService) : inject(AbstractI18nService);
        this.scriptLoaderService = this.injector ? this.injector.get(ScriptLoaderService) : inject(ScriptLoaderService);
        this.Viewport = this.injector ? this.injector.get(Viewport) : inject(Viewport);

        this.viewParent = this.containerWidget.viewParent;

        if (this.viewParent.registerFragment) {
            this.viewParent.registerFragment();
        }

        if (this.spa) {
            this.pageDirective = this.injector ? this.injector.get(SpaPageDirective) : inject(SpaPageDirective);
        } else {
            this.pageDirective = this.injector ? this.injector.get(PageDirective) : inject(PageDirective);
        }
        if (this.pageDirective) {
            this.registerDestroyListener(this.pageDirective.subscribe('attach', data => this.ngOnAttach(data.refreshData)));
            this.registerDestroyListener(this.pageDirective.subscribe('detach', () => this.ngOnDetach()));
        }

        // register functions for binding evaluation
        this.registerExpressions();
        this.initUserScript();

        this.registerWidgets();
        this.initVariables();
        this.registerProps();
        this.defineI18nProps();
        super.init();
    }

    registerWidgets() {
        this.Widgets = {};
        this.Widgets = {};this.containerWidget.Widgets = this.Widgets;
    }

    initUserScript() {
        try {
            this.evalUserScript(this, this.App, this.injector.get(UtilsService));
        } catch (e) {
            console.error(`Error in evaluating prefab (${this.prefabName}) script\n`, e);
        }
    }

    registerChangeListeners() {
        this.containerWidget.registerPropertyChangeListener(this.onPropertyChange);
        this.containerWidget.registerStyleChangeListener(this.onPropertyChange);
    }

    registerDestroyListener(fn: Function) {
        this.destroy$.subscribe(noop, noop, () => fn());
    }

    defineI18nProps() {
        this.appLocale = this.i18nService.getPrefabLocaleBundle(this.prefabName);
    }

    registerProps() {
        this.prefabMngr.getConfig(this.prefabName)
            .then(config => {

                if (config) {
                    this.displayName = config.displayName;
                    Object.entries((config.properties || {}))
                        .forEach(([key, prop]: [string, any]) => {
                            let expr;
                            const value = trim(prop.value);

                            if (startsWith(value, 'bind:')) {
                                expr = value.replace('bind:', '');
                            }

                            Object.defineProperty(this, key, {
                                get: () => this.containerWidget[key],
                                set: nv => this.containerWidget.widget[key] = nv
                            });

                            if (expr) {
                                //[Todo-CSP]: expr will be generated with prefab.comp.expr.ts
                                this.registerDestroyListener(
                                    $watch(expr, this, {}, nv => this.containerWidget.widget[key] = nv)
                                );
                            }
                        });

                    Object.entries((config.events || {}))
                        .forEach(([key, prop]: [string, any]) => {
                            this[key] = (...args) => {
                                const eventName = key.substr(2).toLowerCase();
                                this.containerWidget.invokeEventCallback(eventName, {$event: args[0], $data: args[1]});
                            };
                        });

                    Object.entries((config.methods || {}))
                        .forEach(([key, prop]: [string, any]) => {
                            this.containerWidget[key] = (...args) => {
                                try {
                                    if (this[key]) {
                                        return this[key].apply(this, args);
                                    }
                                } catch (e) {
                                    console.warn(`error in executing prefab-${this.prefabName} method-${key}`);
                                }
                            };
                        });
                }
                this.containerWidget.setProps(config);
                // Reassigning the proxy handler for prefab inbound properties as we
                // will get them only after the prefab config call.
                if (isIE()) {
                    this.containerWidget.widget = this.containerWidget.createProxy();
                }
            });
    }

    initVariables() {
        const variablesService = this.injector.get(VariablesService);

        // get variables and actions instances for the page
        const variableCollection = variablesService.register(this.prefabName, this.getVariables(), this);

        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = {};
        this.Actions = {};
        this.containerWidget.Variables = this.Variables;
        this.containerWidget.Actions = this.Actions;

        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(([name, variable]) => this.Variables[name] = variable);
        Object.entries(variableCollection.Actions).forEach(([name, action]) => this.Actions[name] = action);


        this.viewInit$.subscribe(noop, noop, () => {
            variableCollection.callback(variableCollection.Variables).catch(noop);
            variableCollection.callback(variableCollection.Actions);
        });
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

    invokeOnReady() {
        // triggering watchers so variables and propertiers watching over an expression are updated
        $invokeWatchers(true, true);
        this.onReady();
        if (this.viewParent.resolveFragment) {
            this.viewParent.resolveFragment();
        }
        this.containerWidget.invokeEventCallback('load');
    }

    private loadScripts() {
        return new Promise<void>((resolve) => {
            const scriptsRequired = this.prefabContainerDirective.$element.attr('scripts-to-load');
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

    ngOnAttach(refreshData) {
        this.unmute();
        if(refreshData) {
            const refresh = v => { v && v.startUpdate && v.invoke && v.invoke(); };
            each(this.Variables, refresh);
            each(this.Actions, refresh);
        }
        each(this.Widgets, w => w && w.ngOnAttach && w.ngOnAttach());
    }

    ngOnDetach() {
        this.mute();
        each(this.Widgets, w => w && w.ngOnDetach && w.ngOnDetach());
    }


    ngAfterViewInit(): void {
        this.loadScripts().then(() => {
            this.compileContent = true;
            this.registerChangeListeners();
            setTimeout(() => {
                // trigger viewInit$.complete after a timeout so that the widget listeners are ready before Variable xhr call.
                this.viewInit$.complete();
                this.fragmentsLoaded$.subscribe(noop, noop, () => this.invokeOnReady());
            }, 100);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.complete();
    }

    // user overrides this
    onPropertyChange() {}

    onReady() {}

}
