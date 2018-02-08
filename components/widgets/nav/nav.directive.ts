import { Directive, ElementRef, Injector, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './nav.props';
import { addClass } from '@utils/dom';
import { styler, APPLY_STYLES_TYPE } from '../../utils/styler';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-nav', hasTemplate: false};
const DEFAULT_CLS = 'nav app-nav';

@Directive({
    selector: '[wmNav]'
})
export class NavDirective extends BaseComponent {

    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'type':
                let _cls = '';
                if (nv === 'pills') {
                    _cls = 'nav-pills';
                } else if (nv === 'tabs') {
                    _cls = 'nav-tabs';
                } else if (nv === 'navbar') {
                    _cls = 'navbar-nav';
                }
                addClass(this.$element, _cls);
                break;

            case 'layout':
                addClass(this.$element, `nav-${nv}`);
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
