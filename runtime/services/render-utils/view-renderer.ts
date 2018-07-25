import { AfterViewInit, Compiler, Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, Injector, NgModule, NO_ERRORS_SCHEMA, OnDestroy, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Subject } from 'rxjs';
import { BsDropdownModule, CarouselModule, PopoverModule } from 'ngx-bootstrap';

import { App, extendProto, noop, UserDefinedExecutionContext } from '@wm/core';
import { WmComponentsModule } from '@wm/components';
import { WmMobileComponentsModule } from '@wm/mobile/components';
import { PartialContainerDirective } from '../../components/partial-container/partial-container.directive';
import { PrefabDirective } from '../../components/prefab/prefab.directive';
import { AccessrolesDirective } from '../../directives/accessroles.directive';

const componentCache = new Map<string, any>();

@NgModule({
    declarations: [PartialContainerDirective, PrefabDirective, AccessrolesDirective],
    exports: [
        PartialContainerDirective,
        PrefabDirective,
        AccessrolesDirective
    ]
})
export class TempModule {}

@Injectable()
export class ViewRenderer {

    constructor(private compiler: Compiler, private app: App) {
        app.subscribe('render-resource', options => {
            this.render(
                options.selector,
                options.markup,
                options.styles,
                options.providers,
                options.initFn,
                options.vcRef,
                options.$target,
                options.context
            );
        });
    }

    public render(
        selector: string,
        markup: string,
        styles: any,
        providers: Array<any>,
        componentInitFn: Function,
        vcRef: ViewContainerRef,
        $target: HTMLElement,
        context?: any
    ): Promise<void> {

        let postInitResolveFn;
        const postInitPromise: Promise<void> = new Promise(res => postInitResolveFn = res);

        let componentRef = componentCache.get(selector);

        if (!componentRef) {
            const componentDef = this.getDynamicComponent(
                selector,
                markup,
                [styles],
                providers
            );

            const moduleDef = this.getDynamicModule(componentDef);
            componentRef = this.getComponentFactory(componentDef, moduleDef);
            componentCache.set(selector, componentRef);
        }

        const initSub = (componentRef.componentType as any).init$
            .subscribe(({instance, inj}) => {
                if (context) {
                    // Get the inner prototype and set the context on the prototype
                    extendProto(instance, context);
                }
                componentInitFn(instance, inj);
                initSub.unsubscribe();
            });
        const postInitSub = (componentRef.componentType as any).viewInit$
            .subscribe(() => {
                postInitResolveFn();
                postInitSub.unsubscribe();
            });

        vcRef.clear();
        const component = vcRef.createComponent(componentRef);

        $target.innerHTML = '';
        $target.appendChild(component.location.nativeElement);

        return postInitPromise;
    }

    private getDynamicComponent(
        selector: string,
        template: string,
        styles: Array<string>,
        providers: Array<any> = []
    ) {

        @Component({
            selector,
            template,
            styles,
            providers,
            encapsulation: ViewEncapsulation.None
        })
        class DynamicComponent implements OnDestroy, AfterViewInit {
            onPropertyChange;
            $element;
            _onDestroy;

            static init$ = new Subject();
            static viewInit$ = new Subject();

            constructor(inj: Injector) {
                // create new subject and assign it to the component(page/partial/prefab) context
                this._onDestroy = new Subject();

                DynamicComponent.init$.next({
                    instance: this,
                    inj
                });
            }

            registerDestroyListener(fn: Function) {
                this._onDestroy.subscribe(noop, noop, () => fn());
            }

            ngOnDestroy() {
                // on component destroy, trigger the destroy subject on context
                // Variables are listening to this event to trigger cancel methods on them (to abort any in progress calls)
                this._onDestroy.complete();
            }

            ngAfterViewInit() {
                setTimeout(() => DynamicComponent.viewInit$.next(), 100);
            }
        }

        providers.push({provide: UserDefinedExecutionContext, useExisting: DynamicComponent});

        return DynamicComponent;
    }

    private getDynamicModule(component) {
        @NgModule({
            declarations: [component],
            imports: [
                WmComponentsModule,
                WmMobileComponentsModule,
                FormsModule,
                ReactiveFormsModule,
                TempModule,
                CommonModule,
                CarouselModule.forRoot(),
                BsDropdownModule.forRoot(),
                PopoverModule.forRoot()
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        })
        class DynamicModule {}

        return DynamicModule;
    }

    private getComponentFactory(componentDef, moduleDef) {
        return this.compiler
            .compileModuleAndAllComponentsSync(moduleDef)
            .componentFactories
            .filter(factory => factory.componentType === componentDef)[0];
    }
}