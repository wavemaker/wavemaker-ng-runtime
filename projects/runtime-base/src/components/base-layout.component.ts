import { AfterViewInit, Injector, OnDestroy, ViewChild, Directive } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { PageDirective } from "@wm/components/page";

declare const _;

@Directive()
export abstract class BaseLayoutComponent implements AfterViewInit, OnDestroy {
    injector: Injector;
    route: ActivatedRoute;
    private layoutCreated: boolean;

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
            this.layoutCreated = true;
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

    onActivate(pageComponent: any) {
        _.extend(this, pageComponent);
        if(this.layoutCreated) {
            pageComponent.onActivatePage();
        }
    }
}
