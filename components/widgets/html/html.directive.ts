import { Injector, ElementRef, ChangeDetectorRef, Directive } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './html.props';
import { styler } from '../../utils/styler';
import { addClass, setCSS } from '@utils/dom';

const WIDGET_CONFIG = {widgetType: 'wm-html', hasTemplate: false};

const DEFAULT_CLASS = 'app-html-container';

registerProps();

@Directive({
    selector: '[wmHtml]'
})
export class HtmlDirective extends BaseComponent {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        addClass(this.$element, DEFAULT_CLASS);
        styler(this.$element, this);
    }

    onStyleChange(key, newVal, oldVal) {
        if (key === 'height') {
            setCSS(this.$element, 'overflow', newVal ? 'auto' : '');
        }
    }

}
