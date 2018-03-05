import { Directive, ElementRef, Injector, ChangeDetectorRef, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './nav-item.props';
import { styler, APPLY_STYLES_TYPE } from '../../utils/styler';

registerProps();

const DEFAULT_CLS = 'app-nav-item';
const WIDGET_CONFIG = {widgetType: 'wm-nav-item', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmNavItem]'
})
export class NavItemDirective extends BaseComponent implements OnInit {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
