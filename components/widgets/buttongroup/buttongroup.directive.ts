import { ChangeDetectorRef, Directive, ElementRef, HostBinding, Injector } from '@angular/core';
import { addClass } from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { registerProps } from './buttongroup.props';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-buttongroup', hasTemplate: false};
const DEFAULT_CLS = 'btn-group app-button-group';

@Directive({
    'selector': '[wmButtongroup]'
})
export class ButtonGroupDirective extends BaseComponent {

    @HostBinding('class.btn-group-vertical') vertical: boolean;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
