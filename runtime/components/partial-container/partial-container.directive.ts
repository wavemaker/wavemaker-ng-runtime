import { Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';

import { WidgetRef } from '@wm/components';
import { noop } from '@wm/core';

import { RenderUtilsService } from '../../services/render-utils.service';

declare const _;

@Directive({
    selector: '[partialContainer]:not([content="inline"])'
})
export class PartialContainerDirective {
    get name() {
        return this.componentInstance.name;
    }

    renderPartial(nv, vcRef, componentInstance) {
        return this.renderUtils.renderPartial(
            nv,
            vcRef,
            this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement,
            componentInstance,
            () => (this.inj as any).view.component._resolveFragment()
        );
    }

    onLoadSuccess() {
        this.componentInstance.invokeEventCallback('load');
    }

    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public renderUtils: RenderUtilsService,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef,
        public inj: Injector
    ) {

        (this.inj as any).view.component._registerFragment();

        componentInstance.registerPropertyChangeListener((key, nv, ov) => {
            if (key === 'content') {
                if (componentInstance.$lazyLoad) {
                    componentInstance.$lazyLoad = () => {
                        this.renderPartial(nv, vcRef, componentInstance)
                            .then(() => this.onLoadSuccess());
                        componentInstance.$lazyLoad = noop;
                    };
                } else {
                    this.renderPartial(nv, vcRef, componentInstance).then(() => this.onLoadSuccess());
                }
            }
        });
    }
}