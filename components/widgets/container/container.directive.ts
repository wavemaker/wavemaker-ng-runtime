import { Directive, ElementRef, Injector, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './container.props';
import { addClass } from '@utils/dom';
import { styler, APPLY_STYLES_TYPE } from '../../utils/styler';


registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-container', hasTemplate: false};
const DEFAULT_CLS = 'app-container';

@Directive({
    'selector': '[wmContainer]'
})
export class ContainerDirective extends BaseComponent {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }

}
