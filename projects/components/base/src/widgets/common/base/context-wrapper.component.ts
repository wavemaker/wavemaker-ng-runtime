import { Component, Injector, Input, OnInit } from '@angular/core';
import { StylableComponent } from "./stylable.component";
import { IWidgetConfig } from "../../framework/types";

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-context-wrapper',
};

/*
* After NG17 upgrade, Angular is not passing the ngTemplateContext to the components inside the ng-template.
* WM widgets inside the ng-templates requires the context to evaluate the bind expressions.
* For widgets which are using ng-templates that hosts other widgets, in wm markup transpilation({widget}.build.ts) we are wrapping the widgets inside the ng-templates with <div wmContextWrapper></div>.
* This wrapper component holds the ngTemplateContext.
* In BaseComponent, we are checking the closest parent wmContextWrapper. If it is present then extending the component context with wmContextWrapper context.
*/

@Component({
    selector: '[wmContextWrapper]',
    template: `<ng-content></ng-content>`,
})
export class ContextWrapperComponent extends StylableComponent implements OnInit {
    @Input() explicitContext: any;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
