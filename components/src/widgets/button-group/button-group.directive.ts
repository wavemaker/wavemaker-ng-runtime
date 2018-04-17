import { Directive, HostBinding, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../base/framework/styler';
import { IStylableComponent } from '../base/framework/types';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './button-group.props';

registerProps();

const DEFAULT_CLS = 'btn-group app-button-group';
const WIDGET_CONFIG = {widgetType: 'wm-buttongroup', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmButtonGroup]'
})
export class ButtonGroupDirective extends BaseComponent {

    @HostBinding('class.btn-group-vertical') vertical: boolean;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent, APPLY_STYLES_TYPE.CONTAINER);
    }
}
