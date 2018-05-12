import { ChangeDetectorRef, Component, ElementRef, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, IWidgetConfig, StylableComponent, styler } from '@wm/components';

import { registerProps } from './widget-template.props';
import { provideAsWidgetRef } from '../../../../../components/src/utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-widget-template';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-widget-template', hostClass: DEFAULT_CLS};

@Component({
    selector: 'div[wmWidgetTemplate]',
    templateUrl: './widget-template.component.html',
    providers: [
        provideAsWidgetRef(WidgetTemplateComponent)
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
