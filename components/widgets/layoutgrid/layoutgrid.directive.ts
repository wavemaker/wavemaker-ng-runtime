import { ElementRef, Injector, Directive, ChangeDetectorRef } from '@angular/core';
import { addClass } from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { styler } from '@utils/styler';
import { registerProps } from './layoutgrid.props';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-layoutgrid', hasTemplate: false};
const DEFAULT_CLS = 'app-grid-layout clearfix';

@Directive({
    selector: '[wmLayoutgrid]'
})
export class LayoutgridDirective extends BaseComponent {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this);
    }
}
