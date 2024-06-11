import {Directive, inject, Injector, Input, OnDestroy, Optional, TemplateRef, ViewContainerRef} from '@angular/core';

import {$watch, App, findParent} from '@wm/core';

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
        let viewParentApp = inj ? inj.get(App) : inject(App);
        let lView = (inj as any)._lView;
        this.viewParent = findParent(lView, viewParentApp)
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
