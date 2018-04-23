import { Directive, HostBinding, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './button-group.props';

registerProps();

const DEFAULT_CLS = 'btn-group app-button-group';
const WIDGET_CONFIG = {widgetType: 'wm-buttongroup', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmButtonGroup]'
})
export class ButtonGroupDirective extends StylableComponent {

    @HostBinding('class.btn-group-vertical') vertical: boolean;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
