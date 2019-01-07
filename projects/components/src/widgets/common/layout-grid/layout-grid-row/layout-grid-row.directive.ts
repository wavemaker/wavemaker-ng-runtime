import { Directive, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { IWidgetConfig } from '../../../framework/types';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './layout-grid-row.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-grid-row clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-layout-grid-row',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmLayoutGridRow]',
    providers: [
        provideAsWidgetRef(LayoutGridRowDirective)
    ]
})
export class LayoutGridRowDirective extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
