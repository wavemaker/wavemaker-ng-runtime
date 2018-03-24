import { Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';
import { RenderUtilsService } from '../../services/render-utils.service';

@Directive({
    selector: '[partialContainer]:not([content="inline"])'
})
export class PartialContainerDirective {
    get name() {
        return this.componentInstance.name;
    }

    constructor(
        @Self() @Inject('@Widget') public componentInstance,
        public renderUtils: RenderUtilsService,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef,
        public inj: Injector
    ) {

        (this.inj as any).view.component._registerFragment();

        componentInstance.propertyChange$.subscribe(({key, nv, ov}) => {
            if (key === 'content') {
                this.renderUtils.renderPartial(
                    nv,
                    vcRef,
                    this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement,
                    componentInstance,
                    () => (this.inj as any).view.component._resolveFragment()
                );
            }
        });
    }
}