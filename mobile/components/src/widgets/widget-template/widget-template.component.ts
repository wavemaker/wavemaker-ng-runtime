import { ChangeDetectorRef, Component, ElementRef, forwardRef, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, styler, StylableComponent, WidgetRef, IWidgetConfig } from '@wm/components';
import { registerProps } from './widget-template.props';

registerProps();

const DEFAULT_CLS = 'app-widget-template';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-widget-template', hostClass: DEFAULT_CLS};

@Component({
    selector: 'div[wmWidgetTemplate]',
    templateUrl: './widget-template.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => WidgetTemplateComponent)}
    ]
})
export class WidgetTemplateComponent extends StylableComponent {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(inj, WIDGET_CONFIG);
        styler(this.$element, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'tabIndex':
                break;
        }
    }

}
