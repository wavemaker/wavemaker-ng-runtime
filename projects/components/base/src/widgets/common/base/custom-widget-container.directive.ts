import { Attribute, ComponentFactoryResolver, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';
import { App, $invokeWatchers, noop, ComponentType, CustomWidgetRefProvider } from '@wm/core';
import { WidgetRef } from "../../framework/types";


declare const _;

@Directive({
    selector: '[customWidgetContainer][widgetname]'
})
export class CustomWidgetContainerDirective {

    constructor(
        @Self() @Inject(WidgetRef) public componentInstance,
        public vcRef: ViewContainerRef,
        public elRef: ElementRef,
        public inj: Injector,
        private app: App,
        @Attribute('widgetname') widgetname: string,
        private customWidgetRefProvider: CustomWidgetRefProvider
    ) {
        const widgetnames = this.componentInstance.widgetname;
        this.customWidgetRefProvider.getComponentFactoryRef(widgetname, ComponentType.WIDGET).then((componentFactory) => {
            if (componentFactory) {
                const instanceRef = this.vcRef.createComponent(componentFactory, 0, this.inj);
                this.elRef.nativeElement.appendChild(instanceRef.location.nativeElement);
            }
        });
    }
}