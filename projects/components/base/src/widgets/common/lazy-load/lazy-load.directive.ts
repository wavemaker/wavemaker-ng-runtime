import {
    Directive,
    Inject,
    inject,
    Injector,
    Input,
    OnDestroy,
    Optional,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';

import {$watch, App, findParent} from '@wm/core';
import {extend} from "lodash-es";

@Directive({
  standalone: true,
    selector: '[lazyLoad]'
})
export class LazyLoadDirective implements OnDestroy {
    private readonly viewParent: any;
    private readonly context = {};
    private embeddedView;
    private unSubscribeFn: Function;

    constructor(
        inj: Injector,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any = {}
    ) {
        let viewParentApp = inj ? inj.get(App) : inject(App);
        let lView = (inj as any)._lView;
        this.viewParent = findParent(lView, viewParentApp)
        //this.context = (inj as any).view.context;
        extend(this.context, (inj as any)._lView[8], explicitContext);
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
        if (this.unSubscribeFn) {
            this.unSubscribeFn();
        }
        // Clear the ViewContainerRef to prevent memory leaks
        this.viewContainer.clear();
    }
}
