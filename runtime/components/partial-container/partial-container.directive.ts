import { Directive, ElementRef, Inject, Self, ViewContainerRef } from '@angular/core';
import { PageUtils } from '../../services/page-utils.service';

@Directive({
    selector: '[partialContainer]:not([content="inline"])'
})
export class PartialContainerDirective {
    get name() {
        return this.widget.name;
    }

    constructor(@Self() @Inject('@Widget') public widget, public pageUtils: PageUtils, public vcRef: ViewContainerRef, public elRef: ElementRef) {

        const $target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;

        widget.propertyChange$.subscribe(({key, nv, ov}) => {
            if (key === 'content') {
                this.pageUtils.renderPage(
                    nv,
                    widget.name,
                    vcRef,
                    $target
                );
            }
        });
    }
}