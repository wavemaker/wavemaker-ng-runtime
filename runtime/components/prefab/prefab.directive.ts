import { Directive, ElementRef, Inject, Self, ViewContainerRef } from '@angular/core';
import { PrefabManagerService } from '../../services/prefab-manager.service';

import { WidgetRef } from '@wm/components';

@Directive({
    selector: '[wmPrefab][prefabname]'
})
export class PrefabDirective {

    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public prefabManager: PrefabManagerService,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef
    ) {

        const prefabName = this.componentInstance.prefabName;

        this.prefabManager.init(prefabName, vcRef, elRef, componentInstance)
            .then(config => {
                this.componentInstance.setPrefabProps(config.properties);
            });
    }
}