import { Directive, ElementRef, Inject, Self, ViewContainerRef } from '@angular/core';

import { WidgetRef } from '@wm/components';

import { PrefabRenderer } from '../../services/render-utils/prefab-renderer';

@Directive({
    selector: '[wmPrefab][prefabname]'
})
export class PrefabDirective {

    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public prefabRenderer: PrefabRenderer,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef
    ) {
        const prefabName = this.componentInstance.prefabName;
        this.prefabRenderer.render(prefabName, vcRef, elRef.nativeElement, componentInstance);
    }
}