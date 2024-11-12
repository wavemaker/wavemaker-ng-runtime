import { Attribute, ComponentFactoryResolver, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';
import { App, $invokeWatchers, noop, ComponentType, CustomWidgetRefProvider } from '@wm/core';
import { WidgetRef } from "../../framework/types";


declare const _;

@Directive({
    selector: '[customWidgetContainer][widgetname]'
})
export class CustomWidgetContainerDirective {
    private customWidgetBasePropList = ['widgetname', 'name', 'widgetid', 'customwidgetcontainer', 'wmwidgetcontainer', 'usekeys', 'readonly', 'datasource.bind'];

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
        const cwMarkupEl = this.componentInstance.$element;
        const cwMarkupAttr = cwMarkupEl.prop("attributes");
        const cwMarkupAttrArr = $.map(cwMarkupAttr, (attribute) => {
            if (attribute.name.startsWith('prop-') || this.customWidgetBasePropList.indexOf(attribute.name) > -1) {
                return;
            }
            return attribute.name + '=' + `"${attribute.value}"`;
        });
        this.customWidgetRefProvider.getComponentFactoryRef(widgetname, ComponentType.WIDGET, { baseWidgetAttr: cwMarkupAttrArr }).then((componentFactory) => {
            if (componentFactory) {
                const instanceRef = this.vcRef.createComponent(componentFactory, 0, this.inj);
                this.elRef.nativeElement.appendChild(instanceRef.location.nativeElement);
            }
        });
    }
}