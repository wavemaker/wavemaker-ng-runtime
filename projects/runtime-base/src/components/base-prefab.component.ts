import { AfterViewInit, Injector, OnDestroy, ViewChild, Directive } from '@angular/core';
import { Subject } from 'rxjs';

import { $watch, AbstractI18nService, App, isIE, noop, ScriptLoaderService, UtilsService, $invokeWatchers, Screen } from '@wm/core';
import { WidgetRef} from '@wm/components/base';
import { PageDirective } from '@wm/components/page';
import { PrefabContainerDirective } from '@wm/components/prefab';
import { VariablesService } from '@wm/variables';

import { PrefabManagerService } from '../services/prefab-manager.service';
import { FragmentMonitor } from '../util/fragment-monitor';

declare const _;

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
    pageDirective: PageDirective;
    Screen: Screen;

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
        this.prefabMngr = this.injector.get(PrefabManagerService);
        this.i18nService = this.injector.get(AbstractI18nService);
        this.scriptLoaderService = this.injector.get(ScriptLoaderService);
        this.Screen = this.injector.get(Screen);
        if (this.getContainerWidgetInjector().view.component.registerFragment) {
            this.getContainerWidgetInjector().view.component.registerFragment();
        }

        try {
            this.pageDirective = this.injector.get(PageDirective);
            this.registerDestroyListener(this.pageDirective.subscribe('attach', data => this.ngOnAttach(data.refreshData)));
            this.registerDestroyListener(this.pageDirective.subscribe('detach', () => this.ngOnDetach()));
        } catch (e) {
            // prefab may be part of common partial
        }

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
                            const value = _.trim(prop.value);

                            if (_.startsWith(value, 'bind:')) {
                                expr = value.replace('bind:', '');
                            }

                            Object.defineProperty(this, key, {
                                get: () => this.containerWidget[key],
                                set: nv => this.containerWidget.widget[key] = nv
                            });

                            if (expr) {
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

    invokeOnReady() {
        // triggering watchers so variables and propertiers watching over an expression are updated
        $invokeWatchers(true, true);
        this.onReady();
        if (this.getContainerWidgetInjector().view.component.resolveFragment) {
            this.getContainerWidgetInjector().view.component.resolveFragment();
        }
        this.containerWidget.invokeEventCallback('load');
    }

    private loadScripts() {
        return new Promise((resolve) => {
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
        _.each(this.Widgets, m);
        _.each(this.Variables, m);
        _.each(this.Actions, m);
    }

    unmute() {
        const um = o => { o && o.unmute && o.unmute(); };
        _.each(this.Widgets, um);
        _.each(this.Variables, um);
        _.each(this.Actions, um);
    }

    ngOnAttach(refreshData) {
        this.unmute();
        if(refreshData) {
            const refresh = v => { (v.startUpdate || v.autoUpdate) && v.invoke && v.invoke(); };
            _.each(this.Variables, refresh);
            _.each(this.Actions, refresh);
        }
        this.prefabContainerDirective.ngOnAttach();
    }

    ngOnDetach() {
        this.mute();
        this.prefabContainerDirective.ngOnDetach();
    }


    ngAfterViewInit(): void {
        this.loadScripts().then(() => {
            this.compileContent = true;
            this.viewInit$.complete();
            this.registerChangeListeners();
            setTimeout(() => {
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
