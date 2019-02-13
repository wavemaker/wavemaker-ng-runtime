import { Directive, Injector, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';

import { $watch } from '@wm/core';

declare const _;

@Directive({
    selector: '[lazyLoad]'
})
export class LazyLoadDirective implements OnDestroy {
    private readonly viewParent: any;
    private readonly context;
    private embeddedView;
    private unSubscribeFn: Function;

    constructor(
        inj: Injector,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef
    ) {
        this.viewParent = (inj as any).view.component;
        this.context = (inj as any).view.context;
    }

    @Input()
    set lazyLoad(expr) {
        this.unSubscribeFn = $watch(
            expr,
            this.viewParent,
            this.context,
            (val) => {
                if (!this.embeddedView && val) {
                    this.embeddedView  = this.viewContainer.createEmbeddedView(this.templateRef, this.context);
                    this.unSubscribeFn();
                }
            }
        );
    }

    ngOnDestroy() {
        this.unSubscribeFn();
    }
}
