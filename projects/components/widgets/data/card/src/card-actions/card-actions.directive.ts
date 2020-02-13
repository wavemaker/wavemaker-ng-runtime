import { Directive, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './card-actions.props';

const DEFAULT_CLS = 'app-card-actions';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-card-actions',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmCardActions]'
})
export class CardActionsDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
