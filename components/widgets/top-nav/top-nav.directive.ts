import { Directive, ElementRef, Injector, ChangeDetectorRef, forwardRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './top-nav.props';
import { addClass } from '@utils/dom';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-top-nav', hasTemplate: false};
const DEFAULT_CLS = 'app-top-nav';

@Directive({
    selector: '[wmTopNav]',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => TopNavDirective)}
    ]
})
export class TopNavDirective extends BaseComponent {
    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
