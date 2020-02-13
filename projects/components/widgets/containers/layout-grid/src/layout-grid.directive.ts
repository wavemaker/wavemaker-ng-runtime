import { Directive, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler, StylableComponent } from '@wm/components/base';

import { registerProps } from './layout-grid.props';

const DEFAULT_CLS = 'app-grid-layout clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-layoutgrid',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmLayoutGrid]',
    providers: [
        provideAsWidgetRef(LayoutgridDirective)
    ]
})
export class LayoutgridDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
