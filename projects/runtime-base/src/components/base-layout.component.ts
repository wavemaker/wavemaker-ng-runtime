import { AfterViewInit, Injector, OnDestroy, ViewChild, Directive, AfterContentInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { PageDirective } from "@wm/components/page";


@Directive()
export abstract class BaseLayoutComponent implements AfterViewInit, OnDestroy {
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

    ngAfterViewInit() {
        setTimeout(() => {
            this.overrideRouterOutlet();
        }, 10);
    }

    init() {
        this.route = this.injector.get(ActivatedRoute);
    }

    //TODO: To work cache properly need to implement the below methods and WmRouteReuseStrategy
    ngOnDestroy(): void {
    }

    canReuse() {
    }

    ngOnAttach() {
    }

    ngOnDetach() {
    }
}
