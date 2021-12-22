import {
    Injectable,
    NgModuleRef,
    Type,
    Injector,
    Compiler,
    NgModuleFactory,
} from '@angular/core';
import { PartialRefProvider } from '@wm/core';
import { ComponentType } from '@wm/runtime/base';
import { partialLazyModules, prefabLazyModules, prefabPartialLazyModules } from '../util/lazy-module-routes';

type ModuleWithRoot = Type<any> & { rootComponent: Type<any> };
type Options = {
    prefab: string
};

@Injectable({
    providedIn: 'root'
})
export class LazyComponentRefProviderService extends PartialRefProvider {
    private moduleRef: NgModuleRef<any>;
    
    constructor(private injector: Injector, private compiler: Compiler) {
        super();
    }

    private getLazyModule(componentName: string, componentType: ComponentType, options?: Options) {
        if (componentType === ComponentType.PARTIAL && options && options.prefab) {
           return prefabPartialLazyModules[`${options.prefab}_${componentName}`];
        }
        if (componentType === ComponentType.PARTIAL) {
            return partialLazyModules[componentName];
        }
        if (componentType === ComponentType.PREFAB) {
            return prefabLazyModules[componentName];
        }
    }

    private async getModuleFactory(moduleOrFactory: NgModuleFactory<any> | Type<any>): Promise<NgModuleFactory<any>> {
        if (moduleOrFactory instanceof NgModuleFactory) {
            return moduleOrFactory;
        } else {
            return this.compiler.compileModuleAsync(moduleOrFactory);
        }
    }

    public async getComponentFactoryRef(componentName: string, componentType: ComponentType, options?: Options) {
        try {
            const moduleOrFactory = await this.getLazyModule(componentName, componentType, options).loadChildren();
            const moduleFactory = await this.getModuleFactory(moduleOrFactory);

            this.moduleRef = moduleFactory.create(this.injector);
            const rootComponent = (moduleFactory.moduleType as ModuleWithRoot)
                .rootComponent;
            return this.moduleRef.componentFactoryResolver.resolveComponentFactory(
                rootComponent
            );
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}
