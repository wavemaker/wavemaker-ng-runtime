import { AfterViewInit, Injector, OnDestroy, ViewChild, Directive } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageDirective } from "@wm/components/page";
import { registerFnByExpr, App } from "@wm/core";

declare const _;

@Directive()
export abstract class BaseLayoutComponent implements AfterViewInit, OnDestroy {
    injector: Injector;
    App: App;
    layoutName: string;
    layoutPages: string[];

    @ViewChild(RouterOutlet) routerOutlet: RouterOutlet;
    @ViewChild(PageDirective) pageDirective: PageDirective;

    abstract getExpressions();

    /**
     * function to register bind expressions generated in this page instance
     * getExpressions function is defined in the generated page.comp.ts file
     * @param expressions, map of bind expression vs generated function
     */
    registerExpressions() {
        const expressions = this.getExpressions();
        _.each(expressions, (fn, expr)=>{
            registerFnByExpr(expr, fn[0], fn[1]);
        });
    }

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
        this.App = this.injector.get(App);
        this.App.activeLayoutName = this.layoutName;
        this.App.layoutPages = this.layoutPages;

        // register functions for binding evaluation
        this.registerExpressions();
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

    // This will be called when child route (Page component in the layout) is activated
    onActivate(pageComponent: any) {
        //Add page component scope to layout component so that bindings and watchers in the layout will use the page scope
        _.extend(this, pageComponent);
    }
}
