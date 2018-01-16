import { Directive, ElementRef, Injector } from '@angular/core';
import { addClass, setProperty, toggleClass } from '@utils/dom';
import { initWidget } from '../../utils/init-widget';
import { BaseComponent } from '../base/base.component';
import { styler } from '@utils/styler';
import { registerProps } from './label.props';

registerProps();

const WIDGET_TYPE = 'wm-label';
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

    constructor(inj: Injector, elRef: ElementRef) {
        super();

        this.$host = elRef.nativeElement;
        this.$element = this.$host;

        addClass(this.$element, DEFAULT_CLS);

        initWidget(this, WIDGET_TYPE, (<any>inj).elDef, (<any>inj).view);
        styler(this.$element, this);
    }
}
