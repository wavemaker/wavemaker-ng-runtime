import { ComponentFactoryResolver, Injectable } from '@angular/core';

import { ComponentRefProvider, ComponentType } from '@wm/runtime/base';

const componentRefCache = new Map<ComponentType, Map<string, any>>();

componentRefCache.set(ComponentType.PAGE, new Map<string, any>());
componentRefCache.set(ComponentType.PARTIAL, new Map<string, any>());
componentRefCache.set(ComponentType.PREFAB, new Map<string, any>());

@Injectable()
export class ComponentRefProviderService extends ComponentRefProvider {

    static registerComponentRef(name: string, type: ComponentType, ref: any) {
        componentRefCache.get(type).set(name, ref);
    }

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
        super();
    }

    public async getComponentFactoryRef(componentName: string, componentType: ComponentType): Promise<any> {
        const ref = componentRefCache.get(componentType).get(componentName);
        return Promise.resolve(this.componentFactoryResolver.resolveComponentFactory(ref));
    }
}
