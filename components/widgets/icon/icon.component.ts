import { Injector, ElementRef, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './icon.props';
import { styler } from '../../utils/styler';

registerProps();

const DEFAULT_CLS = 'app-icon-wrapper';
const WIDGET_CONFIG = {widgetType: 'wm-icon', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmIcon]',
    templateUrl: './icon.component.html'
})
export class IconComponent extends BaseComponent implements OnInit {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
