import {Directive, Inject, Injector, Optional} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './card-actions.props';

const DEFAULT_CLS = 'app-card-actions';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-card-actions',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmCardActions]',
    standalone: false
})
export class CardActionsDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
