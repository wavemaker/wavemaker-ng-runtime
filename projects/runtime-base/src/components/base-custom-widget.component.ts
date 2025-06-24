import {
    AfterViewInit,
    Injector,
    OnDestroy,
    ViewChild,
    Directive,
    inject
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {Subject} from 'rxjs';

import {
    $invokeWatchers,
    AbstractI18nService,
    AbstractNavigationService,
    App,
    noop,
    Viewport,
    ScriptLoaderService,
    UtilsService,
    registerFnByExpr,
    $watch,
    isIE, isDefined
} from '@wm/core';
import {getWidgetPropsByType, WidgetRef} from '@wm/components/base';
import { PageDirective, SpaPageDirective } from '@wm/components/page';
import {PrefabDirective} from '@wm/components/prefab';
import { VariablesService } from '@wm/variables';
import { CustomwidgetConfigProvider } from '../types/types';
import { FragmentMonitor } from '../util/fragment-monitor';
import { AppManagerService } from '../services/app.manager.service';
import {commonPartialWidgets} from "./base-partial.component";
import {capitalize, forEach} from "lodash-es";
import {CheckboxsetComponent, RadiosetComponent} from "@wm/components/input";

declare const _;

// export const commonPartialWidgets = {};

@Directive()
export abstract class BaseCustomWidgetComponent extends FragmentMonitor implements AfterViewInit, OnDestroy {
    Widgets: any;
    BaseWidget: any = {};
    Variables: any;
    Actions: any;
    App: App;
    injector: Injector;
    customWidgetName: string;
    activePageName: string;
    route: ActivatedRoute;
    appManager: AppManagerService;
    navigationService: AbstractNavigationService;
    router: Router;
    props: any;
    containerWidget: any;
    i18nService: AbstractI18nService;
    appLocale: any;
    // @ViewChild(PartialDirective) partialDirective;
    pageDirective: PageDirective | SpaPageDirective;
    Prefab: PrefabDirective;
    scriptLoaderService: ScriptLoaderService;
    customwidgetConfigProvider: CustomwidgetConfigProvider;
    Viewport: Viewport;
    compileContent = false;
    spa: boolean;
    events: any;

    destroy$ = new Subject();
    viewInit$ = new Subject();
    private viewParent: any;

    abstract evalUserScript(prefabContext: any, appContext: any, utils: any);

    abstract getVariables();

    getContainerWidgetInjector() {
        return this.containerWidget.inj || this.containerWidget.injector;
    }

    init() {
        let resolveFn: Function;
        const promise = new Promise((res)=> resolveFn = res)
        this.App = this.injector ? this.injector.get(App) : inject(App);
        //making the code compatible in both the JIT and AOT modes
        this.containerWidget = this.injector ? this.injector.get(WidgetRef) : inject(WidgetRef);
        this.i18nService = this.injector ? this.injector.get(AbstractI18nService) : inject(AbstractI18nService);
        this.scriptLoaderService = this.injector ? this.injector.get(ScriptLoaderService) : inject(ScriptLoaderService);
        this.Viewport = this.injector ? this.injector.get(Viewport) : inject(Viewport);
        this.customwidgetConfigProvider = this.injector ? this.injector.get(CustomwidgetConfigProvider) : inject(CustomwidgetConfigProvider);
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
        this.registerPropsInContainerWidget(resolveFn);
        // Using promise to make sure the props are registered in the container widget before registering events, Otherwise no events will be registered
        promise.then(() => this.registerEvents());

        this.registerWidgets();
        this.initVariables();

        this.activePageName = this.App.activePageName; // Todo: remove this
        this.registerProps();
        this.defineI18nProps();

        this.viewInit$.subscribe(noop, noop, () => {
            this.props = this.containerWidget.props;
        });

        if(this.spa) {
            this.pageDirective = this.injector ? this.injector.get(SpaPageDirective) : inject(SpaPageDirective);
        } else {
            this.pageDirective = this.injector ? this.injector.get(PageDirective) : inject(PageDirective);
        }
        if (this.pageDirective) {
            this.registerDestroyListener(this.pageDirective.subscribe('attach', data => this.ngOnAttach(data.refreshData)));
            this.registerDestroyListener(this.pageDirective.subscribe('detach', () => this.ngOnDetach()));
        }
        this.containerWidget.onErroSubject.asObservable().subscribe(() => {
            if(this['onValidStatusChange'])
                return this['onValidStatusChange']();
        });
        super.init();
    }

    registerWidgets() {
        // common partial widgets should be accessible from page
        this.Widgets = Object.create(commonPartialWidgets);

        // expose current page widgets on app
        (this.App as any).Widgets = Object.create(this.Widgets);
    }

    initializeComponentData(children) {
        Array.from(children).forEach((child: any) => {
            if(!child.hasAttribute('wmcustomwidget'))
                this.initializeComponentData(child.children);
            else {
                const asAttr = child.getAttribute('as') || '';
                if (!asAttr) {
                    return;
                }
                let base = child.widget.nativeElement.querySelector(`[name=${asAttr}]`)?.widget;
                let baseWidgetType = base?.widgetType;
                switch (baseWidgetType) {
                    case 'wm-checkboxset':
                        this[asAttr] = new CheckboxsetComponent(this.injector, undefined);
                        this[asAttr]["_select"] = (item: any, $event: any) => {
                            const keys = [];
                            forEach(this[asAttr].datasetItems, (datasetItem: any) => {
                                if(datasetItem.key === item.key)
                                    datasetItem.selected = !datasetItem.selected;

                                if(datasetItem.selected)
                                    keys.push(datasetItem.key);
                            });
                            this[asAttr].triggerInvokeOnChange(keys, $event);
                        }
                        break;
                    case 'wm-radioset':
                        this[asAttr] = new RadiosetComponent(this.injector, undefined);
                        this[asAttr]["_select"] = (item: any, $event: any) => {
                            this[asAttr].triggerInvokeOnChange(item.key, $event);
                        }
                        break;
                }

                if(['wm-checkboxset','wm-radioset'].includes(baseWidgetType)) {
                    for (let [key, value] of this.containerWidget.$attrs) {
                        if(!key.startsWith('props-')) {
                            this[asAttr][key] = value;
    
                            if(key === 'datavalue' && this.containerWidget.formControl)
                                this.containerWidget.updateDataValue(value);
                        }
                    }
                    this[asAttr].initDatasetItems();
                    this.containerWidget[asAttr] = this[asAttr];
                }
            }
        });
    }

    registerBaseWidget() {
        this.initializeComponentData(this.containerWidget.nativeElement.children);
    }

    invokeEvent = (eventName: string) => {
        this.events[eventName]();
    }

    registerEvents() {
        this.events = {};
        this.containerWidget.eventHandlers.forEach((callback: any, key: string) => {
            this.events[key] = (...args) => {
                this.containerWidget.invokeEventCallback(key, {$event: args[0], $data: args[1]});
            };
        });
    }

    registerDestroyListener(fn: Function) {
        this.destroy$.subscribe(noop, noop, () => fn());
    }

    registerChangeListeners() {
        this.containerWidget.registerPropertyChangeListener(this.onPropertyChange);
        this.containerWidget.registerStyleChangeListener(this.onPropertyChange);
    }

    get datavalue() {
        if(this['getDatavalue'])
            return this['getDatavalue']();
    }

    set datavalue(value) {
        this.datavalue = value;
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
            console.error(`Error in evaluating partial (${this.customWidgetName}) script\n`, e);
        }
    }

    initVariables() {
        const variablesService = this.injector ? this.injector.get(VariablesService) : inject(VariablesService);

        // get variables and actions instances for the page
        const variableCollection = variablesService.register(this.customWidgetName, this.getVariables(), this);

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
        // const expressions = this.getExpressions();
        // _.each(expressions, (fn, expr)=>{
        //     registerFnByExpr(expr, fn[0], fn[1]);
        // });
    }

    registerProps() {
        this.props = this.containerWidget.props;
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
        // return new Promise<void>((resolve) => {
        //     const scriptsRequired = this.partialDirective.$element.attr('scripts-to-load');
        //     if (scriptsRequired) {
        //         this.scriptLoaderService
        //             .load(...scriptsRequired.split(','))
        //             .then(resolve);
        //     } else {
        //         resolve();
        //     }
        // });
    }
    registerPropsInContainerWidget(resolveFn: Function) {
        this.customwidgetConfigProvider.getConfig(this.customWidgetName).then((config) => {
            if (config) {
                Object.entries((config.properties || {})).forEach(([key, prop]: [string, any]) => {
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
                        //[Todo-CSP]: expr will be generated with prefab.comp.expr.ts
                        this.registerDestroyListener(
                            $watch(expr, this, {}, nv => this.containerWidget.widget[key] = nv)
                        );
                    }
                })
            }
            this.containerWidget.setProps(config, resolveFn);
            // Reassigning the proxy handler for prefab inbound properties as we
            // will get them only after the prefab config call.
            if (isIE()) {
                this.containerWidget.widget = this.containerWidget.createProxy();
            }
        })
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

    // ngOnInit() {
    //     this.init();
    // }

    ngAfterViewInit(): void {
        this.registerChangeListeners();
        this.registerBaseWidget();
            setTimeout(() => {
                this.viewInit$.complete();
                this.fragmentsLoaded$.subscribe(noop, noop, () => this.invokeOnReady());
            }, 100);
    }

    ngOnDestroy(): void {
        this.destroy$.complete();
    }

    ngOnAttach(refreshData) {
        this.unmute();
        if (refreshData) {
            const refresh = v => { v && v.startUpdate && v.invoke && v.invoke(); };
            _.each(this.Variables, refresh);
            _.each(this.Actions, refresh);
        }
        _.each(this.Widgets, w => w && w.ngOnAttach && w.ngOnAttach());
    }

    ngOnDetach() {
        this.mute();
        _.each(this.Widgets, w => w && w.ngOnDetach && w.ngOnDetach());
    }

    // user overrides this
    onPropertyChange() { }

    onReady(params?) {
    }
}
