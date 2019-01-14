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

import { App, extendProto } from '@wm/core';
import { transpile } from '@wm/transpiler';

import { AppManagerService } from './app.manager.service';
import { RuntimeBaseModule } from '../runtime-base.module';


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
    css: string = '',
    context: any) => {

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
        constructor(public injector: Injector) {
            if (context) {
                // Get the inner prototype and set the context on the prototype
                extendProto(this, context);
            }
        }
    }

    return DynamicComponent;
};

@Injectable()
export class DynamicComponentRefProviderService {

    constructor(
        private app: App,
        private appManager: AppManagerService,
        private compiler: Compiler
    ) {}

    public async getComponentFactoryRef(selector: string, markup: string, options:any = {}): Promise<any> {
        // check in the cache.
        let componentFactoryRef = componentFactoryRefCache.get(selector);

        markup = options.transpile ? transpile(markup) : markup;
        if (!componentFactoryRef || options.noCache) {
            const componentDef = getDynamicComponent(selector, markup, options.styles, options.context);
            const moduleDef = getDynamicModule(componentDef);

            componentFactoryRef = this.compiler
                .compileModuleAndAllComponentsSync(moduleDef)
                .componentFactories
                .filter(factory => factory.componentType === componentDef)[0];

            componentFactoryRefCache.set(selector, componentFactoryRef);
        }
        return componentFactoryRef;
    }
}
