import {Directive, Injector, Optional} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler, StylableComponent } from '@wm/components/base';

import { registerProps } from './layout-grid-row.props';
import {UserDefinedExecutionContext} from '@wm/core';

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
    static initializeProps = registerProps();
    constructor(inj: Injector, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
