import { Directive, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './nav-item.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-nav-item';
const WIDGET_CONFIG = {widgetType: 'wm-nav-item', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmNavItem]',
    providers: [
        provideAsWidgetRef(NavItemDirective)
    ]
})
export class NavItemDirective extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
