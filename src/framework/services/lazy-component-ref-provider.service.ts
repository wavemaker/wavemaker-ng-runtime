import {
    Injectable,
    NgModuleFactoryLoader,
    NgModuleRef,
    Type,
    Injector,
    SystemJsNgModuleLoader,
    Inject,
    NgModuleFactory
} from '@angular/core';
import { PartialRefProvider } from '@wm/core';
import { ComponentType } from '@wm/runtime/base';


type ModuleWithRoot = Type<any> & { rootComponent: Type<any> };

@Injectable({
    providedIn: 'root'
})
export class LazyComponentRefProviderService extends PartialRefProvider {
    private moduleRef: NgModuleRef<any>;
    constructor(
        @Inject(NgModuleFactoryLoader) private loader: SystemJsNgModuleLoader,
        private injector: Injector
    ) {
        super();
    }
    private getModulePath(componentName: string, componentType: ComponentType, options?: any): string {
        if (componentName.length > 0) {
            if (componentType === ComponentType.PARTIAL && options && options.prefab) {
                return `src/app/prefabs/${options.prefab}/partials/${componentName}/${componentName}.module#${componentName
                    .charAt(0)
                    .toUpperCase()}${componentName.slice(1)}Module`;
            }
            if (componentType === ComponentType.PARTIAL) {
                return `src/app/partials/${componentName}/${componentName}.module#${componentName
                    .charAt(0)
                    .toUpperCase()}${componentName.slice(1)}Module`;
            } else if (componentType === ComponentType.PREFAB) {
                return `src/app/prefabs/${componentName}/${componentName}.module#${componentName
                    .charAt(0)
                    .toUpperCase()}${componentName.slice(1)}Module`;
            }
        }
        return null;
    }
    public async getComponentFactoryRef(componentName: string, componentType: ComponentType, options?: {}) {
        let moduleFactory: NgModuleFactory<any>;
        try {
            moduleFactory = await this.loader.load(
                this.getModulePath(componentName, componentType, options)
            );
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
