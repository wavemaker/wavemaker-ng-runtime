import { Directive, Injector } from '@angular/core';

import { IWidgetConfig } from '../../../framework/types';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './card-actions.props';

registerProps();

const DEFAULT_CLS = 'app-card-actions';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-card-actions',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmCardActions]'
})
export class CardActionsDirective extends StylableComponent {
    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
