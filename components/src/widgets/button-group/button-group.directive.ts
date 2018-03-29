import { ChangeDetectorRef, Directive, ElementRef, HostBinding, Injector } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { registerProps } from './button-group.props';

registerProps();

const DEFAULT_CLS = 'btn-group app-button-group';
const WIDGET_CONFIG = {widgetType: 'wm-buttongroup', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmButtonGroup]'
})
export class ButtonGroupDirective extends BaseComponent {

    @HostBinding('class.btn-group-vertical') vertical: boolean;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
