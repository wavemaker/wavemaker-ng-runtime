import { Directive, ElementRef, Injector, ChangeDetectorRef, forwardRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './top-nav.props';
import { styler } from '../../utils/styler';

registerProps();

const DEFAULT_CLS = 'app-top-nav';
const WIDGET_CONFIG = {widgetType: 'wm-top-nav', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTopNav]',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => TopNavDirective)}
    ]
})
export class TopNavDirective extends BaseComponent {
    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this);
    }
}
