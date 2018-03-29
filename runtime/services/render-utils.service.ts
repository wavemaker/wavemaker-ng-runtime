import {
    Compiler,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    Injectable,
    Injector,
    NgModule,
    ViewContainerRef
} from '@angular/core';

import { WmComponentsModule } from '@components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PartialContainerDirective } from '../components/partial-container/partial-container.directive';
import { transpile } from '@transpiler/build';
import { VariablesService } from '@variables/service/variables.service';
import { App } from './app.service';
import { ActivatedRoute } from '@angular/router';
import { AppResourceManagerService } from './app-resource-manager.service';
import { PrefabDirective } from '../components/prefab/prefab.directive';
import { CommonModule } from '@angular/common';
import { getPrefabMinJsonUrl } from './prefab-manager.service';
import { I18nService } from './i18n.service';
import { getValidJSON } from '@utils/utils';

const scriptCache = new Map<string, Function>();
const noop = (...args) => {};

@NgModule({
    declarations: [PartialContainerDirective, PrefabDirective],
    exports: [
        PartialContainerDirective,
        PrefabDirective
    ]
})
class TempModule {}

const getPageOrPartialMinUrl = name => `./pages/${name}/page.min.json`;

interface IPageMinJSON {
    markup: string;
    script: string;
    styles: string;
    variables: string;
}

const getDynamicComponent = (selector: string, template: string, styles: Array<string>, providers: Array<any>, postConstructFn: Function) => {

    @Component({
        selector,
        template,
        styles,
        providers
    })
    class DynamicComponent {
        onPropertyChange;
        $element;

        constructor(inj: Injector) {
            postConstructFn(this, inj);
        }
    }

    return DynamicComponent;
};

const getDynamicModule = component => {
    @NgModule({
        declarations: [component],
        imports: [WmComponentsModule, FormsModule, ReactiveFormsModule, TempModule, CommonModule],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class DynamicModule {
    }

    return DynamicModule;
};

const registerVariablesAndActions = (inj: Injector, identifier: string, variables: any, instance: any) => {
    const variablesService = inj.get(VariablesService);

    const $variables = variablesService.register(identifier, variables, instance);
    instance.Variables = $variables.Variables;
    instance.Actions = $variables.Actions;
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
    constructor(private compiler: Compiler, private app: App,
                private injector: Injector, private route: ActivatedRoute,
                private resouceMngr: AppResourceManagerService,
                private i18nService: I18nService) {
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
        $target: HTMLElement
    ): Promise<void> {

        const componentDef = getDynamicComponent(selector, markup, [styles], providers, postConstructFn);
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
            registerVariablesAndActions(inj, pageName, variables, pageInstance);

            execScript(script, `page-${pageName}`, 'Page', pageInstance, this.app, inj);

            pageInstance.App = this.app;

            monitorFragments(pageInstance, parseEndPromise, () => {
                (pageInstance.onReady || noop)();
                (this.app.onPageReady || noop)(this.app.internals.activePageName, pageInstance);
            });

            this.route.queryParams.subscribe(params => pageInstance.pageParams = params);
        };

        this.renderResource(`app-page-${pageName}`, markup, styles, undefined, postConstructFn, vcRef, $target)
            .then(() => parseEndResolveFn());
    }

    async renderPartial(partialName: string, vcRef: ViewContainerRef, $target: HTMLElement, containerWidget: any, resolveFn: Function) {
        const {markup, script, styles, variables} = await this.loadMinJson(getPageOrPartialMinUrl(partialName));

        let parseEndResolveFn;
        const parseEndPromise: Promise<void> = new Promise(resolve => parseEndResolveFn = resolve);

        const postConstructFn = (partialInstance, inj) => {
            this.defineI18nProps(partialInstance);
            partialInstance.Widgets = {};
            registerVariablesAndActions(inj, partialName, variables, partialInstance);

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

        this.renderResource(`app-partial-${partialName}`, markup, styles, undefined, postConstructFn, vcRef, $target)
            .then(() => parseEndResolveFn());
    }

    async renderPrefab(prefabName: string, vcRef: ViewContainerRef, $target: HTMLElement, containerWidget: any) {
        const {markup, script, styles, variables} = await this.loadMinJson(getPrefabMinJsonUrl(prefabName));

        let onReadyResolveFn = noop;
        const onReadyPromise = new Promise(resolve => onReadyResolveFn = resolve);

        const postConstructFn = (prefabInstance, inj) => {
            this.defineI18nProps(prefabInstance);
            prefabInstance.Widgets = {};
            registerVariablesAndActions(inj, prefabName, variables, prefabInstance);

            execScript(script, `prefab-${prefabName}`, 'Prefab', prefabInstance, this.app, inj);

            prefabInstance.App = this.app;
            containerWidget.onPropertyChange = prefabInstance.onPropertyChange;
            containerWidget.onStyleChange = prefabInstance.onPropertyChange;
            prefabInstance.$element = containerWidget.$element;

            onReadyPromise.then(() => (prefabInstance.onReady || noop)());
        };

        this.renderResource(`app-prefab-${prefabName}`, markup, styles, undefined, postConstructFn, vcRef, $target)
            .then(onReadyResolveFn);
    }
}
