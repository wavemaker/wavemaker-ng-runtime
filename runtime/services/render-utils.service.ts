import { Compiler, Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, Injector, NgModule, OnDestroy, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Subject } from 'rxjs/Subject';
import { BsDropdownModule, CarouselModule, PopoverModule } from 'ngx-bootstrap';

import { BaseComponent, WmComponentsModule } from '@wm/components';
import { transpile } from '@wm/transpiler';
import { VariablesService } from '@wm/variables';
import { $appDigest, $invokeWatchers, AbstractI18nService, App, extendProto, getValidJSON, UserDefinedExecutionContext } from '@wm/core';
import { WmMobileComponentsModule } from '@wm/mobile/components';

import { PartialContainerDirective } from '../components/partial-container/partial-container.directive';
import { AppResourceManagerService } from './app-resource-manager.service';
import { PrefabDirective } from '../components/prefab/prefab.directive';
import { AccessrolesDirective } from '../directives/accessroles.directive';
import { AppManagerService } from './app.manager.service';

const scriptCache = new Map<string, Function>();
const componentCache = new Map<string, any>();
const noop = (...args) => {};

@NgModule({
    declarations: [PartialContainerDirective, PrefabDirective, AccessrolesDirective],
    exports: [
        PartialContainerDirective,
        PrefabDirective,
        AccessrolesDirective
    ]
})
export class TempModule {}

const getPageOrPartialMinUrl = name => `./pages/${name}/page.min.json`;

enum CONTEXT {
    PAGE = 'Page',
    PARTIAL = 'Partial',
    PREFAB = 'Prefab'
}

interface IPageMinJSON {
    markup: string;
    script: string;
    styles: string;
    variables: string;
}

const commonPageWidgets = {};

const getDynamicComponent = (selector: string, template: string, styles: Array<string>, providers: Array<any> = [], postConstructFn: Function, context) => {

    @Component({
        selector,
        template,
        styles,
        providers,
        encapsulation: ViewEncapsulation.None
    })
    class DynamicComponent implements OnDestroy {
        onPropertyChange;
        $element;
        _onDestroy;

        constructor(inj: Injector) {
            // create new subject and assign it to the component(page/partial/prefab) context
            this._onDestroy = new Subject();

            if (context) {
                // Get the inner prototype and set the context on the prototype
                extendProto(this, context);
            }

            postConstructFn(this, inj);
        }

        registerDestroyListener(fn: Function) {
            this._onDestroy.subscribe(() => {}, () => {}, () => fn());
        }

        ngOnDestroy() {
            // on component destroy, trigger the destroy subject on context
            // Variables are listening to this event to trigger cancel methods on them (to abort any in progress calls)
            this._onDestroy.complete();
        }
    }

    providers.push({provide: UserDefinedExecutionContext, useExisting: DynamicComponent});

    return DynamicComponent;
};

const getDynamicModule = component => {
    @NgModule({
        declarations: [component],
        imports: [
            WmComponentsModule,
            WmMobileComponentsModule,
            FormsModule,
            ReactiveFormsModule,
            TempModule,
            CommonModule,
            CarouselModule.forRoot(),
            BsDropdownModule.forRoot(),
            PopoverModule.forRoot()
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class DynamicModule {
    }

    return DynamicModule;
};

const registerVariablesAndActions = (inj: Injector, identifier: string, variables: any, pageInstance: any, appInstance?: any) => {
    const variablesService = inj.get(VariablesService);

    // get variables and actions instances for the page
    const pageVariables = variablesService.register(identifier, variables, pageInstance);

    // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
    pageInstance.Variables = appInstance ? Object.create(appInstance.Variables || null) : {};
    pageInstance.Actions = appInstance ? Object.create(appInstance.Actions || null) : {};

    // assign all the page variables to the pageInstance
    Object.entries(pageVariables.Variables).forEach(([name, variable]) => {
        pageInstance.Variables[name] = variable;
    });
    Object.entries(pageVariables.Actions).forEach(([name, action]) => {
        pageInstance.Actions[name] = action;
    });

    return pageVariables;
};

const _decodeURIComponent = str => {
    return decodeURIComponent(str.replace(/\+/g, ' '));
};

const execScript = (script, identifier, ctx, instance, app, inj) => {
    let fn = scriptCache.get(identifier);
    if (!fn) {
        fn = new Function(ctx, 'App', 'Injector', script);
        scriptCache.set(identifier, fn);
    }
    try {
        fn(instance, app, inj);
    } catch (e) {
        console.warn(`error executing script of ${identifier}`);
    }
};

const monitorFragments = (instance, onParseEnd: Promise<void>, onReadyFn) => {
    let fragments = 0;
    let isParseFinished = false;

    const invokeOnReady = () => {

        if (isParseFinished && !fragments) {
            setTimeout(() => {
                instance._registerFragment = noop;
                instance._resolveFragment = noop;
                onReadyFn();
            }, 100);
        }
    };

    instance._registerFragment = () => fragments++;
    instance._resolveFragment = () => {
        fragments--;
        invokeOnReady();
    };
    onParseEnd.then(() => setTimeout(() => {
        isParseFinished = true;
        invokeOnReady();
    }, 100));
};

@Injectable()
export class RenderUtilsService {
    constructor(
        private compiler: Compiler,
        private app: App,
        private appManager: AppManagerService,
        private injector: Injector,
        private route: ActivatedRoute,
        private resouceMngr: AppResourceManagerService,
        private i18nService: AbstractI18nService
    ) {
        app.subscribe('renderResource', options => {
            this.renderResource(options.selector, options.markup, options.styles, options.providers,
                options.postConstructFn, options.vcRef, options.$target, options.context);
        });
    }

    getComponentFactory(componentDef, moduleDef) {
        return this.compiler
            .compileModuleAndAllComponentsSync(moduleDef)
            .componentFactories
            .filter(factory => factory.componentType === componentDef)[0];
    }

    loadMinJson(url, pageName?): Promise<IPageMinJSON> {
        return this.resouceMngr.get(url, true)
            .then(({markup, script, styles, variables}: IPageMinJSON) => {
                return {
                    markup: transpile(_decodeURIComponent(markup)),
                    script: _decodeURIComponent(script),
                    styles: _decodeURIComponent(styles),
                    variables: getValidJSON(_decodeURIComponent(variables)) || {}
                };
            }, (e) => {
                const details = e.details;
                if (details.status === 404) {
                    this.appManager.notifyApp(this.app.appLocale.MESSAGE_PAGE_NOT_FOUND || 'The page you are trying to reach is not available', 'error');
                }
            });
    }

    renderResource(
        selector: string,
        markup: string,
        styles: any,
        providers: Array<any>,
        postConstructFn: Function,
        vcRef: ViewContainerRef,
        $target: HTMLElement,
        context?
    ): Promise<void> {

        // Commenting this, as same component ref is causing issues with binding references
        // will have to look for a different alternative for performance optimization
        // let componentRef = componentCache.get(selector);

        // if (!componentRef) {
            const componentDef = getDynamicComponent(selector, markup, [styles], providers, postConstructFn, context);
            const moduleDef = getDynamicModule(componentDef);
            const componentRef = this.getComponentFactory(componentDef, moduleDef);
            // componentCache.set(selector, componentRef);
        // }

        vcRef.clear();
        const component = vcRef.createComponent(componentRef);

        $appDigest();
        $target.appendChild(component.location.nativeElement);

        return Promise.resolve();
    }

    private defineI18nProps(instance) {
        instance.appLocale = this.i18nService.getAppLocale();
    }

    async renderPage(pageName: string, vcRef: ViewContainerRef, $target: HTMLElement) {
        const {markup, script, styles, variables} = await this.loadMinJson(getPageOrPartialMinUrl(pageName), pageName);

        let parseEndResolveFn;
        const parseEndPromise: Promise<void> = new Promise(resolve => parseEndResolveFn = resolve);

        const postConstructFn = (pageInstance, inj) => {
            this.defineI18nProps(pageInstance);

            if (pageName === 'Common') {
                pageInstance.Widgets = commonPageWidgets;
            } else {
                // All active pages should have reference to Common page widgets, e.g. Common login dialog
                pageInstance.Widgets = Object.create(commonPageWidgets);
            }
            // register variables
            const variablesInstance = registerVariablesAndActions(inj, pageName, variables, pageInstance, this.app);

            let context = CONTEXT.PAGE;
            if (this.app.isPrefabType) {
                context = CONTEXT.PREFAB;
            } else if (pageName === 'Common') {
                context = CONTEXT.PARTIAL;
            }

            execScript(script, `page-${pageName}`, context, pageInstance, this.app, inj);

            pageInstance.App = this.app;
            pageInstance.App.Widgets = Object.create(pageInstance.Widgets);

            monitorFragments(pageInstance, parseEndPromise, () => {
                // TODO: have to make sure, the widgets are ready with default values, before firing onReady call
                $invokeWatchers(true);
                // Trigger app variables only once. Triggering here, as app variables may be watching over page widgets
                if (!this.appManager.isAppVariablesFired() && pageName !== 'Common') {
                    variablesInstance.callback(this.app.Variables);
                    variablesInstance.callback(this.app.Actions);
                    this.appManager.isAppVariablesFired(true);
                }
                variablesInstance.callback(variablesInstance.Variables);
                variablesInstance.callback(variablesInstance.Actions);
                (pageInstance.onReady || noop)();
                (this.app.onPageReady || noop)(pageName, pageInstance);
            });

            this.app.lastActivePageName = this.app.activePageName;
            this.app.activePageName = pageName;
            this.app.activePage = pageInstance;
            pageInstance.activePageName = pageName;

            this.route.queryParams.subscribe(params => pageInstance.pageParams = params);
        };

        return this.renderResource(`app-page-${pageName}`, markup, styles, undefined, postConstructFn, vcRef, $target)
            .then(() => parseEndResolveFn());
    }

    async renderPrefabPreviewPage(vcRef: ViewContainerRef, $target: HTMLElement) {
        return this.renderResource(
            `app-prefab-self`,
            transpile(`<wm-prefab name="prefab-preview" prefabname="__self__"></wm-prefab>`),
            '',
            undefined,
            noop,
            vcRef,
            $target
        );
    }

    async renderPartial(partialName: string, vcRef: ViewContainerRef, $target: HTMLElement, containerWidget: any, resolveFn: Function) {
        const {markup, script, styles, variables} = await this.loadMinJson(getPageOrPartialMinUrl(partialName));

        let parseEndResolveFn;
        const parseEndPromise: Promise<void> = new Promise(resolve => parseEndResolveFn = resolve);

        const postConstructFn = (partialInstance, inj) => {
            this.defineI18nProps(partialInstance);
            // All partials should have reference to Common page widgets, e.g. Common login dialog
            partialInstance.Widgets = Object.create(commonPageWidgets);

            execScript(script, `partial-${partialName}`, 'Partial', partialInstance, this.app, inj);

            partialInstance.App = this.app;
            partialInstance.Page = this.app.Page;
            partialInstance.activePageName = this.app.activePageName;
            containerWidget.Widgets = partialInstance.Widgets;


            const variablesInstance = registerVariablesAndActions(inj, partialName, variables, partialInstance, this.app);
            containerWidget.Variables = partialInstance.Variables;
            containerWidget.Actions = partialInstance.Actions;

            this.route.queryParams.subscribe(params => partialInstance.pageParams = params);
            partialInstance.pageParams = containerWidget.partialParams;

            monitorFragments(partialInstance, parseEndPromise, () => {
                $invokeWatchers(true);
                // register variable and actions before firing pageReady event
                variablesInstance.callback(variablesInstance.Variables);
                variablesInstance.callback(variablesInstance.Actions);
                (partialInstance.onReady || noop)();
                resolveFn();
            });
        };

        return this.renderResource(`app-partial-${partialName}`, markup, styles, undefined, postConstructFn, vcRef, $target)
            .then(() => parseEndResolveFn());
    }

    async renderPrefab(prefabName: string, config: any, minJsonUrl: string, vcRef: ViewContainerRef, $target: HTMLElement, containerWidget: BaseComponent) {
        const {markup, script, styles, variables} = await this.loadMinJson(minJsonUrl);

        let onReadyResolveFn = noop;
        const onReadyPromise = new Promise(resolve => onReadyResolveFn = resolve);

        const postConstructFn = (prefabInstance, inj) => {
            this.defineI18nProps(prefabInstance);
            prefabInstance.Widgets = {};

            const variableInstances = registerVariablesAndActions(inj, prefabName, variables, prefabInstance);

            execScript(script, `prefab-${prefabName}`, 'Prefab', prefabInstance, this.app, inj);

            prefabInstance.App = this.app;

            containerWidget.registerPropertyChangeListener(prefabInstance.onPropertyChange);
            containerWidget.registerStyleChangeListener(prefabInstance.onPropertyChange);

            // prefabInstance.$element = containerWidget.element;

            // bridge events and methods
            Object.entries((config.properties || {}))
                .forEach(([key, prop]) => {
                    if (prop.type === 'event') {
                        prefabInstance[key] = (locals: any) => {
                            const eventName = key.substr(2).toLowerCase();
                            containerWidget.invokeEventCallback(eventName, (locals || {}));
                        };
                    } else if (prop.type === 'method') {
                        containerWidget[key] = (...args) => {
                            try {
                                prefabInstance[prop.method](...args);
                            } catch (e) {
                                console.warn(`error in executing prefab-${prefabName} method-${key}`);
                            }
                        };
                    }
                });

            onReadyPromise.then(() => {
                $invokeWatchers(true);
                variableInstances.callback(variableInstances.Variables);
                variableInstances.callback(variableInstances.Actions);
                (prefabInstance.onReady || noop)();
                containerWidget.invokeEventCallback('load');
            });
        };

        return this.renderResource(`app-prefab-${prefabName}`, markup, styles, undefined, postConstructFn, vcRef, $target)
            .then(onReadyResolveFn);
    }
}
