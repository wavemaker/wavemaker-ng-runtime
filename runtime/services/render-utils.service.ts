import { Compiler, Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, Injector, NgModule, OnDestroy, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Subject } from 'rxjs/Subject';
import { BsDropdownModule, CarouselModule, PopoverModule } from 'ngx-bootstrap';

import { BaseComponent, WmComponentsModule } from '@wm/components';
import { transpile } from '@wm/transpiler';
import { VariablesService } from '@wm/variables';
import { App, getValidJSON, UserDefinedExecutionContext } from '@wm/core';
import { WmMobileComponentsModule } from '@wm/mobile/components';

import { PartialContainerDirective } from '../components/partial-container/partial-container.directive';
import { AppResourceManagerService } from './app-resource-manager.service';
import { PrefabDirective } from '../components/prefab/prefab.directive';
import { I18nService } from './i18n.service';
import { AccessrolesDirective } from '../directives/accessroles.directive';

const scriptCache = new Map<string, Function>();
const noop = (...args) => {};

@NgModule({
    declarations: [PartialContainerDirective, PrefabDirective, AccessrolesDirective],
    exports: [
        PartialContainerDirective,
        PrefabDirective,
        AccessrolesDirective
    ]
})
class TempModule {}

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
                Object.keys(context).forEach(key => {
                    this[key] = context[key];
                });
            }

            postConstructFn(this, inj);
        }

        registerDestroyListener(fn: Function) {
            this._onDestroy.subscribe(fn);
        }

        ngOnDestroy() {
            // on component destroy, trigger the destroy subject on context
            // Variables are listening to this event to trigger cancel methods on them (to abort any in progress calls)
            this._onDestroy.next();
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
    fn(instance, app, inj);
};

const monitorFragments = (instance, onParseEnd: Promise<void>, onReadyFn) => {
    let fragments = 0;

    const invokeOnReady = () => fragments || onReadyFn();

    instance._registerFragment = () => fragments++;
    instance._resolveFragment = () => {
        fragments--;
        invokeOnReady();
    };
    onParseEnd.then(invokeOnReady);
};

@Injectable()
export class RenderUtilsService {
    constructor(
        private compiler: Compiler,
        private app: App,
        private injector: Injector,
        private route: ActivatedRoute,
        private resouceMngr: AppResourceManagerService,
        private i18nService: I18nService
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
        return this.resouceMngr.get(url, pageName)
            .then(({markup, script, styles, variables}: IPageMinJSON) => {
                return {
                    markup: transpile(_decodeURIComponent(markup)),
                    script: _decodeURIComponent(script),
                    styles: _decodeURIComponent(styles),
                    variables: getValidJSON(_decodeURIComponent(variables)) || {}
                };
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

        const componentDef = getDynamicComponent(selector, markup, [styles], providers, postConstructFn, context);
        const moduleDef = getDynamicModule(componentDef);
        const componentRef = this.getComponentFactory(componentDef, moduleDef);
        const component = vcRef.createComponent(componentRef);

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
            pageInstance.Widgets = {};
            registerVariablesAndActions(inj, pageName, variables, pageInstance, this.app);

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
                (pageInstance.onReady || noop)();
                (this.app.onPageReady || noop)(this.app.internals.activePageName, pageInstance);
            });

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
            partialInstance.Widgets = {};
            registerVariablesAndActions(inj, partialName, variables, partialInstance, this.app);

            execScript(script, `partial-${partialName}`, 'Partial', partialInstance, this.app, inj);

            partialInstance.App = this.app;
            containerWidget.Widgets = partialInstance.Widgets;
            containerWidget.Variables = partialInstance.Variables;
            containerWidget.Actions = partialInstance.Actions;

            monitorFragments(partialInstance, parseEndPromise, () => {
                (partialInstance.onReady || noop)();
                resolveFn();
            });

            this.route.queryParams.subscribe(params => partialInstance.pageParams = params);
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

            registerVariablesAndActions(inj, prefabName, variables, prefabInstance);

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
                            } catch {
                                console.warn(`error in executing prefab-${prefabName} method-${key}`);
                            }
                        };
                    }
                });

            onReadyPromise.then(() => {
                (prefabInstance.onReady || noop)();
                containerWidget.invokeEventCallback('load');
            });
        };

        return this.renderResource(`app-prefab-${prefabName}`, markup, styles, undefined, postConstructFn, vcRef, $target)
            .then(onReadyResolveFn);
    }
}
