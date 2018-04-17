import { Directive, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { IStylableComponent } from '../../../framework/types';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './layout-grid-row.props';

registerProps();

const DEFAULT_CLS = 'app-grid-row clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-layout-grid-row', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmLayoutGridRow]'
})
export class LayoutGridRowDirective extends BaseComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent, APPLY_STYLES_TYPE.CONTAINER);
    }
}
