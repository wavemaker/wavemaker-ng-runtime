import { Component, forwardRef, Injector } from '@angular/core';

import { switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { WidgetRef } from '../../../framework/types';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './layout-grid-column.props';

registerProps();

const DEFAULT_CLS = 'app-grid-column';
const WIDGET_CONFIG = {widgetType: 'wm-gridcolumn', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmLayoutGridColumn]',
    templateUrl: './layout-grid-column.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => LayoutGridColumnComponent)}
    ]
})
export class LayoutGridColumnComponent extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'columnwidth':
                switchClass(this.nativeElement, `col-sm-${nv}`, ov ? `col-sm-${ov}` : '');
                break;
        }
    }

}
