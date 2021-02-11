import {
    Compiler,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    Injectable,
    Injector,
    NgModule,
    NO_ERRORS_SCHEMA,
    ViewEncapsulation
} from '@angular/core';

import { App, getValidJSON, UserDefinedExecutionContext } from '@wm/core';
import { transpile, scopeComponentStyles } from '@wm/transpiler';
import {
    AppManagerService,
    BasePageComponent,
    BasePartialComponent,
    BasePrefabComponent,
    ComponentRefProvider,
    ComponentType,
    RuntimeBaseModule,
    getPrefabMinJsonUrl,
    getPrefabPartialJsonUrl
} from '@wm/runtime/base';

import { AppResourceManagerService } from './app-resource-manager.service';

interface IPageMinJSON {
    markup: string;
    script: string;
    styles: string;
    variables: string;
    config?: string;
}

declare const window: any, _;

const fragmentCache = new Map<string, any>();

window.resourceCache = fragmentCache;

const componentFactoryRefCache = new Map<ComponentType, Map<string, any>>();

componentFactoryRefCache.set(ComponentType.PAGE, new Map<string, any>());
componentFactoryRefCache.set(ComponentType.PARTIAL, new Map<string, any>());
componentFactoryRefCache.set(ComponentType.PREFAB, new Map<string, any>());

const _decodeURIComponent = (str: string) => decodeURIComponent(str.replace(/\+/g, ' '));

const getFragmentUrl = (fragmentName: string, type: ComponentType, options?) => {
    if (type === ComponentType.PAGE || type === ComponentType.PARTIAL) {
        return options && options.prefab ? getPrefabPartialJsonUrl(options.prefab, fragmentName) : `./pages/${fragmentName}/page.min.json`;
    } else if (type === ComponentType.PREFAB) {
        return getPrefabMinJsonUrl(fragmentName);
    }
};

const scriptCache = new Map<string, Function>();
const execScript = (
    script: string,
    identifier: string,
    ctx: string,
    instance: any,
    app: any,
    utils: any
) => {
    let fn = scriptCache.get(identifier);
    if (!fn) {
        fn = new Function(ctx, 'App', 'Utils', script);
        scriptCache.set(identifier, fn);
    }
    fn(instance, app, utils);
};

class BaseDynamicComponent {
    init() {}
}

const getDynamicModule = (componentRef: any) => {
    @NgModule({
        declarations: [componentRef],
        imports: [
            RuntimeBaseModule
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    class DynamicModule {}

    return DynamicModule;
};

const getDynamicComponent = (
    componentName,
    type: ComponentType,
    template: string,
    css: string,
    script: any,
    variables: string,
) => {

    const componentDef = {
        template,
        styles: [css],
        encapsulation: ViewEncapsulation.None
    };

    let BaseClass: any = BaseDynamicComponent;
    let selector = '';
    let context = '';

    switch (type) {
        case ComponentType.PAGE:
            BaseClass = BasePageComponent;
            selector = `app-page-${componentName}`;
            context = 'Page';
            break;
        case ComponentType.PARTIAL:
            BaseClass = BasePartialComponent;
            selector = `app-partial-${componentName}`;
            context = 'Partial';
            break;
        case ComponentType.PREFAB:
            BaseClass = BasePrefabComponent;
            selector = `app-prefab-${componentName}`;
            context = 'Prefab';
            break;
    }

    @Component({
        ...componentDef,
        selector,
        providers: [
            {
                provide: UserDefinedExecutionContext,
                useExisting: DynamicComponent
            }
        ]
    })
    class DynamicComponent extends BaseClass {
        pageName;
        partialName;
        prefabName;

        constructor(public injector: Injector) {
            super();

            switch (type) {
                case ComponentType.PAGE:
                    this.pageName = componentName;
                    break;
                case ComponentType.PARTIAL:
                    this.partialName = componentName;
                    break;
                case ComponentType.PREFAB:
                    this.prefabName = componentName;
                    break;
            }

            super.init();
        }

        evalUserScript(instance: any, appContext: any, utils: any) {
            execScript(script, selector, context, instance, appContext, utils);
        }

        getVariables() {
            return JSON.parse(variables);
        }
    }

    return DynamicComponent;
};

@Injectable()
export class ComponentRefProviderService extends ComponentRefProvider {

    private loadResourcesOfFragment(componentName, componentType, options?): Promise<IPageMinJSON> {
        const url = getFragmentUrl(componentName, componentType, options);

        const resource = fragmentCache.get(url);

        if (resource) {
            return Promise.resolve(resource);
        }

        return this.resouceMngr.get(url, true)
            .then(({markup, script, styles, variables}: IPageMinJSON) => {
                const response = {
                    markup: transpile(_decodeURIComponent(markup)).markup,
                    script: _decodeURIComponent(script),
                    styles: scopeComponentStyles(componentName, componentType, _decodeURIComponent(styles)),
                    variables: getValidJSON(_decodeURIComponent(variables))
                };
                fragmentCache.set(url, response);

                return response;
            }, e => {
                const status = e.details.status;
                const errorMsgMap = {
                    404 : this.app.appLocale.MESSAGE_PAGE_NOT_FOUND || 'The page you are trying to reach is not available',
                    403 : this.app.appLocale.LABEL_ACCESS_DENIED || 'Access Denied'
                };
                return Promise.reject(errorMsgMap[status]);
            });
    }

    constructor(
        private resouceMngr: AppResourceManagerService,
        private app: App,
        private appManager: AppManagerService,
        private compiler: Compiler
    ) {
        super();
    }

    public async getComponentFactoryRef(componentName: string, componentType: ComponentType, options?: {}): Promise<any> {
        // check in the cache.
        const componentFactoryMap = componentFactoryRefCache.get(componentType);
        let componentFactoryRef;
        if (componentFactoryMap) {
            componentFactoryRef = componentFactoryMap.get(componentName);

            if (componentFactoryRef) {
                return componentFactoryRef;
            }
        }

        return this.loadResourcesOfFragment(componentName, componentType, options)
            .then(({markup, script, styles, variables})  => {

                const componentDef = getDynamicComponent(componentName, componentType, markup, styles, script, JSON.stringify(variables));
                const moduleDef = getDynamicModule(componentDef);

                componentFactoryRef = this.compiler
                    .compileModuleAndAllComponentsSync(moduleDef)
                    .componentFactories
                    .filter(factory => factory.componentType === componentDef)[0];

                componentFactoryRefCache.get(componentType).set(componentName, componentFactoryRef);

                return componentFactoryRef;
            }, (err) => {
                if (err) {
                    const msg = "Error while loading page";
                    // console the error for easy debugging
                    console.log(msg, err);
                    this.appManager.notifyApp(
                        _.isString(err) ? err : msg + ', check browser console for error details',
                        'error'
                    );
                }
            });
    }

    // clears the cache map
    public clearComponentFactoryRefCache() {
        this.resouceMngr.clearCache();
        fragmentCache.clear();
        componentFactoryRefCache.forEach(map => {
            map.clear();
        });
    }
}
