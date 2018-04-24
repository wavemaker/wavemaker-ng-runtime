import { Directive, forwardRef, Injector } from '@angular/core';

import { WidgetRef } from '../../framework/types';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './nav-item.props';
import { StylableComponent } from '../base/stylable.component';

registerProps();

const DEFAULT_CLS = 'app-nav-item';
const WIDGET_CONFIG = {widgetType: 'wm-nav-item', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmNavItem]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => NavItemDirective)}
    ]
})
export class NavItemDirective extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
