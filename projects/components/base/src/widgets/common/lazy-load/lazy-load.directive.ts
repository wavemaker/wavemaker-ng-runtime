import {Directive, inject, Injector, Input, OnDestroy, Optional, TemplateRef, ViewContainerRef} from '@angular/core';

import {$watch, App, UserDefinedExecutionContext} from '@wm/core';

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
        let viewParentApp = inject(App);
        let lView = (inj as any)._lView;
        const getParentlView = (lView: any) => {
            let parentlView = lView[3];
            if(typeof lView[1] === "boolean") { // this is lContainer, not lView if this is boolean
                return getParentlView(parentlView);
            }
            let componentType = lView[1]["type"];
            if(componentType === 0 || componentType === 1) {
                return lView[8];
            } else { // when componentType == 2, then fetch parent again
                return getParentlView(parentlView);
            }
        }
        this.viewParent = getParentlView(lView) || viewParentApp;
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
