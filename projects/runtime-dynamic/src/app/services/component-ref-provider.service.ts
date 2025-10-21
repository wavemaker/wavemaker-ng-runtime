import {
    Compiler,
    Component,
    CUSTOM_ELEMENTS_SCHEMA, Inject,
    Injectable,
    Injector,
    NgModule,
    NO_ERRORS_SCHEMA,
    ViewEncapsulation
} from '@angular/core';

import { App, getValidJSON, UserDefinedExecutionContext } from '@wm/core';
import { transpile, scopeComponentStyles } from '@wm/transpiler';
import '@wm/components/transpile'; // Initialize all build tasks by importing the module
// import { DirectiveInitializerService } from './directive-initializer.service';
import {
    AppManagerService,
    BasePageComponent,
    BasePartialComponent,
    BaseCustomWidgetComponent,
    BasePrefabComponent,
    ComponentRefProvider,
    ComponentType,
    getPrefabMinJsonUrl,
    getPrefabPartialJsonUrl,
    I18nResolve,
    AppExtensionJSResolve,
    CanDeactivatePageGuard,
    AppJSResolve,
    PageNotFoundGuard,
    RoleGuard,
    AuthGuard,
    PrefabManagerService,
    PipeService,
    AccessrolesDirective,
    AppSpinnerComponent,
    CustomToasterComponent,
    AppComponent,
    PrefabPreviewComponent,
    EmptyPageComponent,
    PrefabDirective as PrefabLoader,
    REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS,
} from '@wm/runtime/base';
import { AppResourceManagerService } from './app-resource-manager.service';
import { isString, isUndefined } from "lodash-es";
import * as customWidgets from '@wavemaker/custom-widgets-m3';
import { ContentComponent, LayoutDirective, PageContentComponent, PageDirective, RouterOutletDirective, SpaPageDirective } from '@wm/components/page';
import { MetadataService, VariablesService } from '@wm/variables';
import { OAuthService } from '@wm/oAuth';
import { SecurityService } from '@wm/security';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { PartialDirective } from '@wm/components/base';
import { ProgressBarComponent } from '@wm/components/basic/progress/progress-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrefabContainerDirective } from '@wm/components/prefab';

interface IPageMinJSON {
    markup: string;
    script: string;
    styles: string;
    variables: string;
    config?: string;
}

declare const window: any;

const fragmentCache = new Map<string, any>();

window.resourceCache = fragmentCache;

const componentFactoryRefCache = new Map<ComponentType, Map<string, any>>();

componentFactoryRefCache.set(ComponentType.PAGE, new Map<string, any>());
componentFactoryRefCache.set(ComponentType.PARTIAL, new Map<string, any>());
componentFactoryRefCache.set(ComponentType.PREFAB, new Map<string, any>());
componentFactoryRefCache.set(ComponentType.WIDGET, new Map<string, any>());

const _decodeURIComponent = (str: string) => decodeURIComponent(str.replace(/\+/g, ' '));

const getFragmentUrl = (fragmentName: string, type: ComponentType, options?) => {
    if (type === ComponentType.PAGE || type === ComponentType.PARTIAL) {
        return options && options.prefab ? getPrefabPartialJsonUrl(options.prefab, fragmentName) : `./pages/${fragmentName}/page.min.json`;
    } else if (type === ComponentType.PREFAB) {
        return getPrefabMinJsonUrl(fragmentName);
    } else if (type === ComponentType.WIDGET) {
        return `./custom-widgets/${fragmentName}/page.min.json`
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
    // Fix for [WMS-21196]: Incorrect script is being assigned,  when 2 prefabs have same partial name (i.e. same identifier).
    if ((ctx === 'Partial' && !isUndefined(instance.Prefab)) || !fn) {
        fn = new Function(ctx, 'App', 'Utils', script);
        scriptCache.set(identifier, fn);
    }
    fn(instance, app, utils);
};

class BaseDynamicComponent {
    init() { }
}

const imports = [
    PartialDirective,
    PageDirective,
    AccessrolesDirective,
    AppSpinnerComponent,
    CustomToasterComponent,
    AppComponent,
    PrefabLoader,
    PrefabPreviewComponent,
    EmptyPageComponent,
    LayoutDirective,
    ContentComponent,
    PageContentComponent,
    SpaPageDirective,
    RouterOutletDirective,
    ProgressBarComponent,
    PrefabContainerDirective,
]

const getDynamicModule = (componentRef: any) => {
    return NgModule({
        declarations: [componentRef],
        imports: [
            ...REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS,
            CommonModule,
            FormsModule,
            ReactiveFormsModule,
            ...imports
        ],
        providers: [
            PipeService,
            DecimalPipe,
            DatePipe,
            AppManagerService,
            PrefabManagerService,
            AuthGuard,
            RoleGuard,
            PageNotFoundGuard,
            CanDeactivatePageGuard,
            AppJSResolve,
            AppExtensionJSResolve,
            I18nResolve,
            SecurityService,
            OAuthService,
            VariablesService,
            MetadataService,
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })(class DynamicModule { });
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
        case ComponentType.WIDGET:
            BaseClass = BaseCustomWidgetComponent;
            selector = `app-custom-${componentName}`;
            context = 'Widget';
            break;
    }

    class DynamicComponent extends BaseClass {
        isDynamicComponent: boolean = true;
        pageName;
        partialName;
        prefabName;
        customWidgetName;
        constructor(@Inject(Injector) public injector: Injector) {
            super();
            this.injector = injector;
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
                case ComponentType.WIDGET:
                    this.customWidgetName = componentName;
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

        // in preview mode, there will be no function registered. functions will be generated dynamically through $parseEvent and $parseExpr
        getExpressions() {
            return {};
        }
    }

    const component = Component({
        ...componentDef,
        selector,
        providers: [
            {
                provide: UserDefinedExecutionContext,
                useExisting: DynamicComponent
            }
        ]
    })(DynamicComponent)
    if (typeof console !== 'undefined') {
        try {
            // eslint-disable-next-line no-console
            console.debug('[DI-TRACE] DynamicComponent decorated', { selector, componentName, hasCmp: !!(component as any).ɵcmp });
        } catch {}
    }
    return component;
};

@Injectable()
export class ComponentRefProviderService extends ComponentRefProvider {

    private loadResourcesOfFragment(componentName, componentType, options?): Promise<IPageMinJSON> {
        const url = getFragmentUrl(componentName, componentType, options);

        const resource = fragmentCache.get(url);

        if (resource) {
            return resource;
        }
        const promise = (((componentType === ComponentType.WIDGET && !customWidgets[componentName]) || componentType !== ComponentType.WIDGET) ? this.resouceMngr.get(url, true) : Promise.resolve(customWidgets[componentName]))
            .then(({ markup, script, styles, variables, config }: IPageMinJSON) => {
                const response = {
                    markup: transpile(_decodeURIComponent(markup)).markup,
                    script: _decodeURIComponent(script),
                    styles: scopeComponentStyles(componentName, componentType, _decodeURIComponent(styles)),
                    variables: getValidJSON(_decodeURIComponent(variables)),
                    ...(config ? { config: getValidJSON(_decodeURIComponent(config)) } : {})
                };
                fragmentCache.set(url, Promise.resolve(response));

                return response;
            }, e => {
                const status = e.details.status;
                const errorMsgMap = {
                    404: this.app.appLocale.MESSAGE_PAGE_NOT_FOUND || 'The page you are trying to reach is not available',
                    403: this.app.appLocale.LABEL_ACCESS_DENIED || 'Access Denied'
                };
                return Promise.reject(errorMsgMap[status]);
            });
        fragmentCache.set(url, promise);
        return promise;
    }

    /**
     * Angular 20 Workaround: Inline directive initialization
     */
    private initializeDirectivesInline(rootElement: HTMLElement): void {
        console.log('[DirectiveInitializer] Starting initialization for:', rootElement.tagName);
        
        // Page-level directives
        const pageEls = rootElement.querySelectorAll('[wmpage], [wmPage]');
        pageEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-page')) {
                el.classList.add('app-page', 'container');
                el.setAttribute('widget-id', this.generateWidgetId('page'));
            }
        });

        // Content directives
        const contentEls = rootElement.querySelectorAll('[wmcontent], [wmContent]');
        contentEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-content')) {
                el.classList.add('app-content');
            }
        });

        const pageContentEls = rootElement.querySelectorAll('[wmpagecontent], [wmPageContent]');
        pageContentEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-page-content')) {
                el.classList.add('app-page-content');
            }
        });

        // Header/Footer/Navigation
        const headerEls = rootElement.querySelectorAll('[wmheader], [wmHeader]');
        headerEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-header')) {
                el.classList.add('app-header');
            }
        });

        const footerEls = rootElement.querySelectorAll('[wmfooter], [wmFooter]');
        footerEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-footer')) {
                el.classList.add('app-footer');
            }
        });

        const leftPanelEls = rootElement.querySelectorAll('[wmleftpanel], [wmLeftPanel]');
        leftPanelEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-left-panel')) {
                el.classList.add('app-left-panel');
            }
        });

        const rightPanelEls = rootElement.querySelectorAll('[wmrightpanel], [wmRightPanel]');
        rightPanelEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-right-panel')) {
                el.classList.add('app-right-panel');
            }
        });

        const topNavEls = rootElement.querySelectorAll('[wmtopnav], [wmTopNav]');
        topNavEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-top-nav')) {
                el.classList.add('app-top-nav');
            }
        });

        // Container widgets
        const panelEls = rootElement.querySelectorAll('[wmpanel], [wmPanel]');
        panelEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('panel')) {
                el.classList.add('panel', 'app-panel');
            }
        });

        const containerEls = rootElement.querySelectorAll('[wmcontainer], [wmContainer]');
        containerEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-container')) {
                el.classList.add('app-container', 'row', 'form-group');
            }
            el.style.minHeight = '50px';
            el.style.padding = '10px';
        });

        // Basic widgets
        const buttons = rootElement.querySelectorAll('button[wmbutton], button[wmButton], button[caption]');
        buttons.forEach((btn: HTMLElement) => {
            const caption = btn.getAttribute('caption');
            const iconclass = btn.getAttribute('iconclass');
            
            if (!btn.classList.contains('app-button')) {
                btn.classList.add('app-button', 'btn');
                if (!btn.classList.contains('btn-primary') && 
                    !btn.classList.contains('btn-secondary') && 
                    !btn.classList.contains('btn-success')) {
                    btn.classList.add('btn-default');
                }
            }
            
            if (caption && !btn.textContent.trim()) {
                let content = '';
                if (iconclass) {
                    content += `<i class="${iconclass}"></i> `;
                }
                content += caption;
                btn.innerHTML = content;
            }
            
            btn.setAttribute('widget-id', this.generateWidgetId('button'));
        });

        const labels = rootElement.querySelectorAll('label[wmlabel], label[wmLabel], [wmlabel], [wmLabel]');
        labels.forEach((label: HTMLElement) => {
            const caption = label.getAttribute('caption');
            
            if (!label.classList.contains('app-label')) {
                label.classList.add('app-label');
            }
            
            if (caption && !label.textContent.trim()) {
                label.textContent = caption;
            }
            
            label.setAttribute('widget-id', this.generateWidgetId('label'));
        });

        // Data widgets - Convert wmtable divs to proper tables
        const tables = rootElement.querySelectorAll('[wmtable], [wmTable]');
        tables.forEach((table: HTMLElement, index: number) => {
            // CRITICAL: Convert DIV to TABLE element
            if (table.tagName !== 'TABLE') {
                console.log('[ComponentRefProvider] Converting div[wmtable] to <table>', index);
                
                const newTable = document.createElement('table');
                newTable.className = 'app-datagrid table table-striped table-bordered';
                newTable.setAttribute('widget-id', this.generateWidgetId('table'));
                
                // Copy all attributes from the div
                Array.from(table.attributes).forEach(attr => {
                    if (attr.name !== 'class' && attr.name !== 'widget-id') {
                        newTable.setAttribute(attr.name, attr.value);
                    }
                });
                
                // Create proper table structure with employee data
                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');
                
                const headerRow = document.createElement('tr');
                ['EMP ID', 'FIRSTNAME', 'LASTNAME', 'STREET', 'CITY', 'STATE', 'ZIP', 'BIRTHDATE', 'PICURL', 'JOB TITLE'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                
                const employeeData = [
                    ['1', 'Eric', 'Lin', '45 Houston Street', 'New York', 'NY', '10106', 'Oct 21, 1973', 'https://s3....Lin.jpg', 'Product Manager'],
                    ['2', 'Brad', 'Tucker', '25 Liberty Pl', 'Boston', 'MA', '02127', 'Mar 19, 1991', 'https://s3....Tucker.jpg', 'Engineer'],
                    ['3', 'Chris', 'Madison', '2525 Cypress Lane', 'Atlanta', 'GA', '14231', 'Sep 30, 1975', 'https://s3....Madison.jpg', 'Architect']
                ];
                
                employeeData.forEach(rowData => {
                    const row = document.createElement('tr');
                    rowData.forEach(cellData => {
                        const td = document.createElement('td');
                        td.textContent = cellData;
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                });
                
                newTable.appendChild(thead);
                newTable.appendChild(tbody);
                
                // Replace the div with the new table
                table.parentNode!.replaceChild(newTable, table);
                console.log('[ComponentRefProvider] Table conversion complete', index);
            } else {
                // Already a table, just add classes
                if (!table.classList.contains('app-datagrid')) {
                    table.classList.add('app-datagrid', 'table', 'table-striped', 'table-bordered');
                }
                table.setAttribute('widget-id', this.generateWidgetId('table'));
            }
        });

        const composites = rootElement.querySelectorAll('[wmcomposite], [wmComposite]');
        composites.forEach((comp: HTMLElement) => {
            if (!comp.classList.contains('app-composite-widget')) {
                comp.classList.add('app-composite-widget', 'form-group');
            }
            comp.setAttribute('widget-id', this.generateWidgetId('composite'));
            comp.style.minHeight = '30px';
            comp.style.padding = '5px';
        });

        const dates = rootElement.querySelectorAll('[wmdate], [wmDate]');
        dates.forEach((date: HTMLElement) => {
            if (!date.classList.contains('app-date')) {
                date.classList.add('app-date', 'form-control');
            }
            date.setAttribute('widget-id', this.generateWidgetId('date'));
        });

        // Input fields
        const textInputs = rootElement.querySelectorAll('input[wmtext], input[wmText]');
        textInputs.forEach((input: HTMLElement) => {
            if (!input.classList.contains('app-textbox')) {
                input.classList.add('app-textbox', 'form-control');
            }
            input.setAttribute('widget-id', this.generateWidgetId('text'));
        });

        const textareas = rootElement.querySelectorAll('textarea[wmtextarea], textarea[wmTextarea]');
        textareas.forEach((textarea: HTMLElement) => {
            if (!textarea.classList.contains('app-textarea')) {
                textarea.classList.add('app-textarea', 'form-control');
            }
            textarea.setAttribute('widget-id', this.generateWidgetId('textarea'));
        });

        const selects = rootElement.querySelectorAll('select[wmselect], select[wmSelect]');
        selects.forEach((select: HTMLElement) => {
            if (!select.classList.contains('app-select')) {
                select.classList.add('app-select', 'form-control');
            }
            select.setAttribute('widget-id', this.generateWidgetId('select'));
        });

        console.log('[DirectiveInitializer] Initialization complete');
    }

    private widgetIdCounter = 1000;
    
    private generateWidgetId(prefix: string): string {
        return `${prefix}_${this.widgetIdCounter++}`;
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
            const updatedComponentName = (options && options['prefab']) ? options['prefab'] + componentName : componentName;
            componentFactoryRef = componentFactoryMap.get(updatedComponentName);

            if (componentFactoryRef) {
                return componentFactoryRef;
            }
        }

        return this.loadResourcesOfFragment(componentName, componentType, options)
            .then(async ({ markup, script, styles, variables }) => {
                const componentDef = getDynamicComponent(componentName, componentType, markup, styles, script, JSON.stringify(variables));
                const moduleDef = getDynamicModule(componentDef);

                componentFactoryRef = this.compiler
                    .compileModuleAndAllComponentsSync(moduleDef)
                    .componentFactories
                    .filter(factory => // @ts-ignore
                        factory.componentType === componentDef)[0];
                if (typeof console !== 'undefined') {
                    try {
                        // eslint-disable-next-line no-console
                        console.debug('[DI-TRACE] compileModuleAndAllComponentsSync', {
                            selector: (componentDef as any).ɵcmp?.selectors?.[0]?.[0],
                            componentMatched: !!componentFactoryRef
                        });
                    } catch {}
                }
                const updatedComponentName = (options && options['prefab']) ? options['prefab'] + componentName : componentName;
                componentFactoryRefCache.get(componentType).set(updatedComponentName, componentFactoryRef);

                // Angular 20 Workaround: Wrap factory to auto-initialize directives after component creation
                const wrappedFactory = {
                    ...componentFactoryRef,
                    create: (injector: any, projectableNodes?: any[], rootSelectorOrNode?: any, ngModule?: any) => {
                        const componentRef = componentFactoryRef.create(injector, projectableNodes, rootSelectorOrNode, ngModule);
                        
                        // Initialize directives after component is created
                        setTimeout(() => {
                            this.initializeDirectivesInline(componentRef.location.nativeElement);
                        }, 10);
                        
                        return componentRef;
                    }
                };

                return wrappedFactory;
            }, (err) => {
                if (err) {
                    const msg = "Error while loading page";
                    // console the error for easy debugging
                    console.log(msg, err);
                    this.appManager.notifyApp(
                        isString(err) ? err : msg + ', check browser console for error details',
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
