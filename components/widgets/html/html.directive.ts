import { Injector, ElementRef, ChangeDetectorRef, Directive } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './html.props';
import { styler } from '../../utils/styler';
import { setCSS } from '@utils/dom';

const DEFAULT_CLS = 'app-html-container';
const WIDGET_CONFIG = {widgetType: 'wm-html', hostClass: DEFAULT_CLS};

registerProps();

@Directive({
    selector: '[wmHtml]'
})
export class HtmlDirective extends BaseComponent {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }

    onStyleChange(key, newVal, oldVal) {
        if (key === 'height') {
            setCSS(this.$element, 'overflow', newVal ? 'auto' : '');
        }
    }

    onPropertyChange(key, newVal) {
        if (key === 'content') {
            this.$element.innerHTML = newVal;
        }
    }
}
