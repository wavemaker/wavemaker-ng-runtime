import { ComponentFactoryResolver, Injectable, Inject } from '@angular/core';

import { ComponentRefProvider, ComponentType } from '@wm/runtime/base';
import { LazyComponentRefProviderService } from './partial-ref-provider.service';

const componentRefCache = new Map<ComponentType, Map<string, any>>();

componentRefCache.set(ComponentType.PAGE, new Map<string, any>());
componentRefCache.set(ComponentType.PARTIAL, new Map<string, any>());
componentRefCache.set(ComponentType.PREFAB, new Map<string, any>());

@Injectable()
export class ComponentRefProviderService extends ComponentRefProvider {

    static registerComponentRef(name: string, type: ComponentType, ref: any, componentFactory?: any) {
        componentRefCache.get(type).set(name, {ref: ref, componentFactory: componentFactory});
    }

    constructor(private componentFactoryResolver: ComponentFactoryResolver, @Inject(LazyComponentRefProviderService) private lazyComponentRef) {
        super();
    }

    public async getComponentFactoryRef(componentName: string, componentType: ComponentType): Promise<any> {
        const value = componentRefCache.get(componentType).get(componentName);
        if (!value && (componentType === ComponentType.PARTIAL || componentType === ComponentType.PREFAB)) {
            const partialRef = await this.lazyComponentRef.getComponentFactoryRef(
                componentName,
                componentType
            );
            if (partialRef) {
                return Promise.resolve(partialRef);
            }
        }
        if (!value.componentFactory) {
            value.componentFactory = this.componentFactoryResolver.resolveComponentFactory(value.ref);
        }
        return Promise.resolve(value.componentFactory);
    }
}
