import { ElementRef, Injector, Directive, ChangeDetectorRef } from '@angular/core';
import { switchClass } from 'utils/dom';
import { BaseComponent } from '../../base/base.component';
import { APPLY_STYLES_TYPE, styler } from '../../../utils/styler';
import { registerProps } from './layout-grid-column.props';

registerProps();

const DEFAULT_CLS = 'app-grid-column';
const WIDGET_CONFIG = {widgetType: 'wm-gridcolumn', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmLayoutGridColumn]'
})
export class GridcolumnDirective extends BaseComponent {

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'columnwidth':
                switchClass(this.$element, `col-sm-${nv}`, ov ? `col-sm-${ov}` : '');
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
