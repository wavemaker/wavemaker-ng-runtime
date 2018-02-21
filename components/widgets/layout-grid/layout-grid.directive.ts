import { ElementRef, Injector, Directive, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { registerProps } from './layout-grid.props';

registerProps();

const DEFAULT_CLS = 'app-grid-layout clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-layoutgrid', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmLayoutGrid]'
})
export class LayoutgridDirective extends BaseComponent {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
