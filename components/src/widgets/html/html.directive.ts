import { Directive, Injector } from '@angular/core';

import { setCSS } from '@wm/utils';

import { styler } from '../base/framework/styler';
import { IStylableComponent } from '../base/framework/types';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './html.props';

const DEFAULT_CLS = 'app-html-container';
const WIDGET_CONFIG = {widgetType: 'wm-html', hostClass: DEFAULT_CLS};

registerProps();

@Directive({
    selector: '[wmHtml]'
})
export class HtmlDirective extends BaseComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this as IStylableComponent);
    }

    onStyleChange(key, newVal, oldVal) {
        if (key === 'height') {
            setCSS(this.nativeElement, 'overflow', newVal ? 'auto' : '');
        }
    }

    onPropertyChange(key, newVal) {
        if (key === 'content') {
            this.nativeElement.innerHTML = newVal;
        }
    }
}
