import { Directive, ElementRef, Inject, Self, ViewContainerRef } from '@angular/core';

import { WidgetRef } from '@wm/components';

import { PrefabManagerService } from '../../services/prefab-manager.service';
import { PrefabPreviewManagerService } from '../../services/prefab-preview-manager.service';

@Directive({
    selector: '[wmPrefab][prefabname]'
})
export class PrefabDirective {

    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public prefabManager: PrefabManagerService,
        public prefabPreviewManager: PrefabPreviewManagerService,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef
    ) {

        const prefabName = this.componentInstance.prefabName;

        (prefabName === '__self__' ? this.prefabPreviewManager : this.prefabManager)
            .init(prefabName, vcRef, elRef, componentInstance)
            .then(config => {
                this.componentInstance.setPrefabProps(config.properties);
            });
    }
}