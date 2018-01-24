import { ElementRef, Injector, Directive, ChangeDetectorRef } from '@angular/core';
import { addClass, switchClass } from '@utils/dom';
import { BaseComponent } from '../../base/base.component';
import { styler } from '../../../utils/styler';
import { registerProps } from './gridcolumn.props';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-gridcolumn', hasTemplate: false};
const DEFAULT_CLS = 'app-grid-column';

@Directive({
    selector: '[wmGridcolumn]'
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

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this);
    }
}
