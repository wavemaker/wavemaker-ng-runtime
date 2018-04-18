import { Directive, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './layout-grid.props';

registerProps();

const DEFAULT_CLS = 'app-grid-layout clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-layoutgrid', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmLayoutGrid]'
})
export class LayoutgridDirective extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
