import { Directive, Injector } from '@angular/core';

import { IStylableComponent } from '../../framework/types';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './nav-item.props';

registerProps();

const DEFAULT_CLS = 'app-nav-item';
const WIDGET_CONFIG = {widgetType: 'wm-nav-item', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmNavItem]'
})
export class NavItemDirective extends BaseComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent, APPLY_STYLES_TYPE.CONTAINER);
    }
}
