import { Attribute, Directive, Injector } from '@angular/core';

import { isMobileApp, setCSS, switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { IWidgetConfig } from '../../../framework/types';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './layout-grid-column.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-grid-column';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-gridcolumn',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmLayoutGridColumn]',
    providers: [
        provideAsWidgetRef(LayoutGridColumnDirective)
    ]
})
export class LayoutGridColumnDirective extends StylableComponent {

    constructor(inj: Injector, @Attribute('height') height) {
        super(inj, WIDGET_CONFIG);

        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    onPropertyChange(key, nv, ov?) {
        const prefix = isMobileApp() ? 'xs' : 'sm';
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, `col-${prefix}-${nv}`, ov ? `col-${prefix}-${ov}` : '');
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

}
