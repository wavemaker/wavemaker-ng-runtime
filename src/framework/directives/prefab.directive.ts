import { ComponentFactoryResolver, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';

import { WidgetRef } from '@wm/components';
import { PrefabManagerService } from '../services/prefab-manager.service';
import { getPrefabComponentRef } from '../util/page-util';

@Directive({
    selector: '[wmPrefab][prefabname]'
})
export class PrefabDirective {

    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef,
        private prefabMngr: PrefabManagerService,
        private resolver: ComponentFactoryResolver,
        private injector: Injector
    ) {
        const prefabName = this.componentInstance.prefabName;

        this.prefabMngr.loadDependencies(prefabName)
            .then(() => {
                const componentRef = getPrefabComponentRef(prefabName);
                const componentFactory = this.resolver.resolveComponentFactory(componentRef, );
                const instanceRef = this.vcRef.createComponent(componentFactory, 0, injector);

                this.elRef.nativeElement.appendChild(instanceRef.location.nativeElement);
            });
    }
}
