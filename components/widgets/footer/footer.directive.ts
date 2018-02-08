import { Directive, ElementRef, Injector, ChangeDetectorRef, forwardRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './footer.props';
import { addClass } from '@utils/dom';
import { styler, APPLY_STYLES_TYPE } from '../../utils/styler';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-footer', hasTemplate: false};
const DEFAULT_CLS = 'app-footer clearfix';

@Directive({
    selector: '[wmFooter]',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => FooterDirective)}
    ]
})
export class FooterDirective extends BaseComponent {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
