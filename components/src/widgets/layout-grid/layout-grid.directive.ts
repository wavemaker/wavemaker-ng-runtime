import { Directive, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../base/framework/styler';
import { IStylableComponent } from '../base/framework/types';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './layout-grid.props';

registerProps();

const DEFAULT_CLS = 'app-grid-layout clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-layoutgrid', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmLayoutGrid]'
})
export class LayoutgridDirective extends BaseComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent, APPLY_STYLES_TYPE.CONTAINER);
    }
}
