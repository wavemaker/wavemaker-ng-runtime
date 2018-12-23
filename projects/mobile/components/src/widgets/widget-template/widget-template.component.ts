import { Component, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';

import { registerProps } from './widget-template.props';

registerProps();

const DEFAULT_CLS = 'app-widget-template';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-widget-template', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmWidgetTemplate]',
    templateUrl: './widget-template.component.html',
    providers: [
        provideAsWidgetRef(WidgetTemplateComponent)
    ]
})
export class WidgetTemplateComponent extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }

    public onPropertyChange(key, nv, ov?) {
        if (key === 'tabindex') {
            return;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
