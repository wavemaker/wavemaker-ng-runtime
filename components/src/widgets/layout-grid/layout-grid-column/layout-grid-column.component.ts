import { Component, Injector } from '@angular/core';

import { switchClass } from '@wm/utils';

import { APPLY_STYLES_TYPE, styler } from '../../base/framework/styler';
import { IStylableComponent } from '../../base/framework/types';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './layout-grid-column.props';

registerProps();

const DEFAULT_CLS = 'app-grid-column';
const WIDGET_CONFIG = {widgetType: 'wm-gridcolumn', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmLayoutGridColumn]',
    templateUrl: './layout-grid-column.component.html'
})
export class LayoutGridColumnComponent extends BaseComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent, APPLY_STYLES_TYPE.CONTAINER);
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'columnwidth':
                switchClass(this.nativeElement, `col-sm-${nv}`, ov ? `col-sm-${ov}` : '');
                break;
        }
    }

}
