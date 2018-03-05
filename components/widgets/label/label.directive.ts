import { ChangeDetectorRef, Directive, ElementRef, Injector, OnInit } from '@angular/core';
import { setProperty, toggleClass } from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './label.props';

registerProps();

const DEFAULT_CLS = 'app-label';
const WIDGET_CONFIG = {widgetType: 'wm-label', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmLabel]'
})
export class LabelDirective extends BaseComponent implements OnInit {

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

        styler(this.$element, this);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
