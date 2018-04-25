import { Directive, forwardRef, Injector } from '@angular/core';

import { switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { IWidgetConfig, WidgetRef } from '../../../framework/types';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './layout-grid-column.props';

registerProps();

const DEFAULT_CLS = 'app-grid-column';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-gridcolumn',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmLayoutGridColumn]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => LayoutGridColumnDirective)}
    ]
})
export class LayoutGridColumnDirective extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'columnwidth':
                switchClass(this.nativeElement, `col-xs-${nv}`, ov ? `col-xs-${ov}` : '');
                break;
        }
    }

}
