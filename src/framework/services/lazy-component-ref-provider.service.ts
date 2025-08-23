import { Injectable, ComponentFactoryResolver } from '@angular/core';
import { PartialRefProvider } from '@wm/core';
import { ComponentType } from '@wm/runtime/base';
import { partialLazyModules, prefabLazyModules, prefabPartialLazyModules } from '../util/lazy-module-routes';

type Options = {
    prefab: string
};

@Injectable({
    providedIn: 'root'
})
export class LazyComponentRefProviderService extends PartialRefProvider {
    constructor(
        private componentFactoryResolver: ComponentFactoryResolver
    ) {
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

    public async getComponentFactoryRef(componentName: string, componentType: ComponentType, options?: Options) {
        try {
            const lazyModule = this.getLazyModule(componentName, componentType, options);

            if (!lazyModule) {
                console.error(`No lazy module found for ${componentName}`);
                return null;
            }

            // Load the component
            const loadedComponent = await lazyModule.loadComponent();

            if (!loadedComponent) {
                console.error(`Failed to load component ${componentName}`);
                return null;
            }

            // For standalone components, create a component factory
            return this.componentFactoryResolver.resolveComponentFactory(loadedComponent);
        } catch (e) {
            console.error('Error in getComponentFactoryRef:', e);
            return null;
        }
    }
}
