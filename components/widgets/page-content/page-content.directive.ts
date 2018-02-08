import { Directive, ElementRef, Injector, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './page-content.props';
import { addClass, switchClass } from '@utils/dom';
import { styler, APPLY_STYLES_TYPE } from '../../utils/styler';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-page-content', hasTemplate: false};
const DEFAULT_CLS = 'app-page-content app-content-column';

@Directive({
    selector: '[wmPageContent]'
})
export class PageContentDirective extends BaseComponent {

    onPropertyChange(key, nv, ov) {
        if (key === 'columnwidth') {
            switchClass(this.$element, `col-md-${nv} col-sm-${nv}`, `col-md-${ov} col-sm-${ov}`);
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
