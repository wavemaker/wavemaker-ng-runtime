import {
    Injectable,
    NgModuleFactoryLoader,
    NgModuleRef,
    Type,
    Injector,
    SystemJsNgModuleLoader,
    Inject,
    NgModuleFactory
} from "@angular/core";
import { PartialRefProvider, ComponentType } from "@wm/runtime/base";


type ModuleWithRoot = Type<any> & { rootComponent: Type<any> };

@Injectable({
    providedIn: "root"
})
export class LazyComponentRefProviderService extends PartialRefProvider {
    private moduleRef: NgModuleRef<any>;
    constructor(
        @Inject(NgModuleFactoryLoader) private loader: SystemJsNgModuleLoader,
        private injector: Injector
    ) {
        super();
    }
    private getModulePath(componentName: string, componentType: ComponentType): string {
        if (componentName.length > 0) {
            if (componentType == ComponentType.PARTIAL) {
                return `src/app/partials/${componentName}/${componentName}.module#${componentName
                    .charAt(0)
                    .toUpperCase()}${componentName.slice(1)}Module`;
            } else if (componentType == ComponentType.PREFAB) {
                return `src/app/prefabs/${componentName}/${componentName}.module#${componentName
                    .charAt(0)
                    .toUpperCase()}${componentName.slice(1)}Module`;
            }
        }
        return null;
    }
    public async getComponentFactoryRef(componentName:string,componentType: ComponentType) {
        let moduleFactory: NgModuleFactory<any>;
        try {
            moduleFactory = await this.loader.load(
                this.getModulePath(componentName, componentType)
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
