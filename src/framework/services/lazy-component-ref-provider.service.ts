import {
    Injectable,
    NgModuleRef,
    Type,
    Injector,
} from '@angular/core';
import { PartialRefProvider } from '@wm/core';
import { ComponentType } from '@wm/runtime/base';
import { getLazyModule, Options } from '../util/lazy-module-util';

type ModuleWithRoot = Type<any> & { rootComponent: Type<any> };

@Injectable({
    providedIn: 'root'
})
export class LazyComponentRefProviderService extends PartialRefProvider {
    private moduleRef: NgModuleRef<any>;
    
    constructor(private injector: Injector) {
        super();
    }

    public async getComponentFactoryRef(componentName: string, componentType: ComponentType, options?: Options) {
        try {
            const moduleFactory = await getLazyModule(componentName, componentType, options).loadChildren();

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
