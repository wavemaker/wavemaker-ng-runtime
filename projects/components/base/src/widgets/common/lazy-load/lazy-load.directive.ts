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
        let currentlView = (inj as any)._lView;
        if(currentlView[1].type === 1 || currentlView[1].type === 2) {
            let parentlView = (inj as any)._lView[3];
            if(parentlView[1].type == 1 || parentlView[1].type == 2) {
                this.viewParent = parentlView[8];
            }
        }
        //this.context = (inj as any).view.context;
        this.context = (inj as any)._lView[8];
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
