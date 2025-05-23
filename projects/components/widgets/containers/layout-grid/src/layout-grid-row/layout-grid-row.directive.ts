import {Directive, Inject, Injector, Optional} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler, StylableComponent } from '@wm/components/base';

import { registerProps } from './layout-grid-row.props';

const DEFAULT_CLS = 'app-grid-row clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-layout-grid-row',
    hostClass: DEFAULT_CLS
};

@Directive({
  standalone: true,
    selector: '[wmLayoutGridRow]',
    providers: [
        provideAsWidgetRef(LayoutGridRowDirective)
    ]
})
export class LayoutGridRowDirective extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
