import {Directive, Injector, Input, OnDestroy, Optional, TemplateRef, ViewContainerRef} from '@angular/core';

import {$watch, UserDefinedExecutionContext} from '@wm/core';

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
        private viewContainer: ViewContainerRef,
        @Optional() public _viewParent: UserDefinedExecutionContext
    ) {
        this.viewParent = _viewParent;
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
