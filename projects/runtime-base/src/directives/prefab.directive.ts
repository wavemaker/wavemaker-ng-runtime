import {
    ComponentFactoryResolver,
    Directive,
    ElementRef,
    Inject,
    Injector,
    Self,
    ViewContainerRef
} from '@angular/core';

import { WidgetRef } from '@wm/components/base';

import { PrefabManagerService } from '../services/prefab-manager.service';
import { ComponentRefProvider, ComponentType } from '../types/types';
import { App } from '@wm/core';

@Directive({
    selector: '[wmPrefab][prefabname]',
    exportAs: "wmPrefab"
})
export class PrefabDirective {
    showLoader: boolean = true;
    public app: any;
    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef,
        private prefabMngr: PrefabManagerService,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        private componentRefProvider: ComponentRefProvider,
        app: App
    ) {
        const prefabName = this.componentInstance.prefabName;
        this.app = app;
        this.prefabMngr.loadDependencies(prefabName)
            .then(async () => {
                const componentFactory = await this.componentRefProvider.getComponentFactoryRef(prefabName, ComponentType.PREFAB);
                if (componentFactory) {
                    const instanceRef = this.vcRef.createComponent(componentFactory, 0, injector);
                    this.elRef.nativeElement.appendChild(instanceRef.location.nativeElement);
                }
            }).finally(() => {
                this.showLoader = false;
            });
    }
}
