import {
    Compiler,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    Injectable,
    NgModule,
    NO_ERRORS_SCHEMA,
    ViewEncapsulation
} from '@angular/core';

import { App, extendProto, isDefined } from '@wm/core';
import { transpile } from '@wm/transpiler';
import { initComponentsBuildTask } from '@wm/build-task';

import { AppManagerService } from './app.manager.service';
import { RuntimeBaseModule } from '../runtime-base.module';

initComponentsBuildTask();

const componentFactoryRefCache = new Map<string, any>();

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
    selector,
    template: string,
    css: string = '') => {

    const componentDef = {
        template,
        styles: [css],
        encapsulation: ViewEncapsulation.None
    };

    @Component({
        ...componentDef,
        selector
    })
    class DynamicComponent {
    }

    return DynamicComponent;
};

@Injectable()
export class DynamicComponentRefProviderService {
    private counter = 1;

    constructor(
        private app: App,
        private appManager: AppManagerService,
        private compiler: Compiler
    ) {}

    public async getComponentFactoryRef(selector: string, markup: string, options: any = {}): Promise<any> {
        // check in the cache.
        let componentFactoryRef = componentFactoryRefCache.get(selector);

        markup = options.transpile ? transpile(markup) : markup;
        if (!componentFactoryRef || options.noCache) {
            const componentDef = getDynamicComponent(selector, markup, options.styles);
            const moduleDef = getDynamicModule(componentDef);

            componentFactoryRef = this.compiler
                .compileModuleAndAllComponentsSync(moduleDef)
                .componentFactories
                .filter(factory => factory.componentType === componentDef)[0];

            componentFactoryRefCache.set(selector, componentFactoryRef);
        }
        return componentFactoryRef;
    }

    /**
     * Creates the component dynamically and add it to the DOM
     * @param target: HTML element where we need to append the created component
     * @param markup: Template of the component
     * @param context: Scope of the component
     * @param options: We have options like
                       selector: selector of the component
                       transpile: flag for transpiling HTML. By default it is true
                       nocache: flag for render it from cache or not. By default it is true
     */
    public async addComponent(target: HTMLElement, markup: string, context = {}, options: any = {}) {
        options.transpile = isDefined(options.transpile) ? options.transpile : true;
        options.noCache = isDefined(options.noCache) ? options.noCache : true;
        options.selector = isDefined(options.selector) ? options.selector : 'wm-dynamic-component-' + this.counter++;
        const componentFactoryRef = await this.getComponentFactoryRef(options.selector, markup, options);
        const component = this.app.dynamicComponentContainerRef.createComponent(componentFactoryRef, 0);
        extendProto(component.instance, context);
        if (options.method === 'after') {
            target.after(component.location.nativeElement);
        } else {
            target.appendChild(component.location.nativeElement);
        }
    }
}
