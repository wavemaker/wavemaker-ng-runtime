import { AfterContentInit, Directive, ElementRef, Injector, OnDestroy, Optional } from '@angular/core';

import {Viewport, ViewportEvent} from '@wm/core';
import { registerProps } from './custom-widget-prop';
import { StylableComponent, provideAsWidgetRef, getWidgetPropsByType } from '@wm/components/base';

const DEFAULT_CLS = 'app-custom-widget-container clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-custom-widget-container', hostClass: DEFAULT_CLS};
declare const _;

@Directive({
    selector: '[wmCustomWidget]',
    providers: [
        provideAsWidgetRef(CustomWidgetDirective)
    ]
})
export class CustomWidgetDirective extends StylableComponent implements OnDestroy, AfterContentInit {
    static initializeProps = registerProps();

    constructor(inj: Injector, private viewport: Viewport) {
        super(inj, WIDGET_CONFIG);
        this.registerDestroyListener(this.viewport.subscribe(ViewportEvent.RESIZE, data => this.callback('resize', data)));
        this.registerDestroyListener(this.viewport.subscribe(ViewportEvent.ORIENTATION_CHANGE, data => this.callback('orientationchange', data)));
    }
    ngAfterContentInit() {
        let customWidget        = this.nativeElement.closest('[customwidgetcontainer]') || this.nativeElement.closest('[wmwidgetcontainer]'),
            inheritedProps      = {},
            customWidgetProps   = Array.from(getWidgetPropsByType("wm-custom-widget-container").keys());
        for(let i = 0; i < customWidget.attributes.length; i++) {
            let attr = customWidget.attributes.item(i);
            if(attr.value && attr.value !== '' && !customWidgetProps.includes(attr.name))
                inheritedProps[attr.name] = attr.value;
        }
        this.processChildren(this.nativeElement.children, inheritedProps);
    }

    processChildren(children: any, inheritedProps: { [key: string]: string }) {
        Array.from(children).forEach((child: any) => {
            if(!child.hasAttribute('base-widget'))
                this.processChildren(child.children, inheritedProps);
            else {
                for (const [key, value] of Object.entries(inheritedProps)) {
                    if(key.includes(".event") || key.includes('.bind'))
                        this.processAttr(key, value, {widget: child.widget, nativeElement: child});
                    else
                        child.widget[key] = value;
                }
            }
        });
    }

    private callback(eventName, locals?: object) {
        locals = _.assign({ widget: this }, locals);
        this.invokeEventCallback(eventName, locals);
    }

    public ngOnAttach() {
        this.callback('attach');
    }

    public ngOnDetach() {
        this.callback('detach');
    }

    public ngOnDestroy() {
        this.callback('destroy');
        super.ngOnDestroy();
    }

}
