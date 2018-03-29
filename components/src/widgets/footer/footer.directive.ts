import { ChangeDetectorRef, Directive, ElementRef, forwardRef, Injector } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './footer.props';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';

registerProps();

const DEFAULT_CLS = 'app-footer clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-footer', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmFooter]',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => FooterDirective)}
    ]
})
export class FooterDirective extends BaseComponent {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
