import {
    ComponentFactoryResolver,
    Directive,
    ElementRef,
    Inject,
    Injector,
    OnDestroy,
    Self,
    ViewContainerRef
} from '@angular/core';

import { WidgetRef } from '@wm/components/base';

import { PrefabManagerService } from '../services/prefab-manager.service';
import { ComponentRefProvider, ComponentType } from '../types/types';

@Directive({
  standalone: true,
    selector: '[wmPrefab][prefabname]'
})
export class PrefabDirective implements OnDestroy {

    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef,
        private prefabMngr: PrefabManagerService,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        private componentRefProvider: ComponentRefProvider
    ) {
        const prefabName = this.componentInstance.prefabName;

        this.prefabMngr.loadDependencies(prefabName)
            .then(async () => {
                const componentFactory = await this.componentRefProvider.getComponentFactoryRef(prefabName, ComponentType.PREFAB);
                if (componentFactory) {
                    const instanceRef = this.vcRef.createComponent(componentFactory, 0, injector);
                    this.elRef.nativeElement.appendChild(instanceRef.location.nativeElement);
                }
            });
    }

    ngOnDestroy() {
        // Clear the ViewContainerRef to prevent memory leaks
        this.vcRef.clear();
    }
}
