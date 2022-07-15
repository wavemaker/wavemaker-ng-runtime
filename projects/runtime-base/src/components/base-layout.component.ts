import { AfterViewInit, Injector, OnDestroy, ViewChild, Directive, AfterContentInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { FragmentMonitor } from '../util/fragment-monitor';
import { PageDirective } from "@wm/components/page";


@Directive()
export abstract class BaseLayoutComponent extends FragmentMonitor implements AfterViewInit, OnDestroy {
    injector: Injector;
    route: ActivatedRoute;

    @ViewChild(RouterOutlet) routerOutlet: RouterOutlet;
    @ViewChild(PageDirective) pageDirective: PageDirective;


    private overrideRouterOutlet() {
        //override the attach/detach methods
        const oAttach = this.routerOutlet.attach;
        const oDetach = this.routerOutlet.detach;
        this.routerOutlet.attach = (componentRef: any) => {
            oAttach.call(this.routerOutlet, componentRef);
            componentRef.instance.ngOnAttach();
        };
        this.routerOutlet.detach = () => {
            const componentRef = oDetach.call(this.routerOutlet);
            return componentRef;
        };
    }

    ngAfterViewInit() {debugger;
        this.route.snapshot.data['__wm_page_reuse'] = this.canReuse();
        setTimeout(() => {
            this.overrideRouterOutlet();
        }, 10);
    }

    init() {
        this.route = this.injector.get(ActivatedRoute);
    }

    ngOnDestroy(): void {
    }

    canReuse() {
        return !!(this.pageDirective && this.pageDirective.cache);
    }

    ngOnAttach() {
        this.route.snapshot.data['__wm_page_reuse'] = this.canReuse();
    }

    ngOnDetach() {
    }
}
