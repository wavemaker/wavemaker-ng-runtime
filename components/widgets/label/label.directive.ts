import { ChangeDetectorRef, Directive, ElementRef, Injector } from '@angular/core';
import { addClass, setProperty, toggleClass } from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { styler } from '@utils/styler';
import { registerProps } from './label.props';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-label', hasTemplate: false};
const DEFAULT_CLS = 'app-label';

@Directive({
    'selector': '[wmLabel]'
})
export class LabelDirective extends BaseComponent {

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'caption':
                setProperty(this.$element, 'textContent', nv);
                break;
            case 'required':
                toggleClass(this.$element, 'required', nv);
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this);
    }
}
