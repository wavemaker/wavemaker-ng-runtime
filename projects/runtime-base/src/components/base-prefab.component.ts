import { AfterViewInit, Injector, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { $watch, AbstractI18nService, App, noop, UtilsService } from '@wm/core';
import { WidgetRef } from '@wm/components';
import { VariablesService } from '@wm/variables';

import { PrefabManagerService } from '../services/prefab-manager.service';

declare const _;

export abstract class BasePrefabComponent implements AfterViewInit, OnDestroy {
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

    destroy$ = new Subject();
    viewInit$ = new Subject();

    abstract evalUserScript(prefabContext: any, appContext: any, utils: any);
    abstract getVariables();

    init() {
        this.App = this.injector.get(App);

        this.containerWidget = this.injector.get(WidgetRef);
        this.prefabMngr = this.injector.get(PrefabManagerService);
        this.i18nService = this.injector.get(AbstractI18nService);

        this.initUserScript();

        this.registerWidgets();
        this.registerChangeListeners();
        this.initVariables();
        this.registerProps();
        this.defineI18nProps();
    }

    registerWidgets() {
        this.Widgets = {};
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
            });
    }

    initVariables() {
        const variablesService = this.injector.get(VariablesService);

        // get variables and actions instances for the page
        const variableCollection = variablesService.register(this.prefabName, this.getVariables(), this);

        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = {};
        this.Actions = {};

        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(([name, variable]) => this.Variables[name] = variable);
        Object.entries(variableCollection.Actions).forEach(([name, action]) => this.Actions[name] = action);


        this.viewInit$.subscribe(noop, noop, () => {

            variableCollection.callback(variableCollection.Variables);
            variableCollection.callback(variableCollection.Actions);
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.viewInit$.complete();
            this.onReady();
            this.containerWidget.invokeEventCallback('load');
        }, 100);
    }

    ngOnDestroy(): void {
        this.containerWidget.invokeEventCallback('destroy');
        this.destroy$.complete();
    }

    // user overrides this
    onPropertyChange() {}

    onReady() {}

}
