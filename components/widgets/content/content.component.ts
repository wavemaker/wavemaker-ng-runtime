import { ElementRef, Injector, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './content.props';
import { styler } from '../../utils/styler';

registerProps();

const DEFAULT_CLS = 'app-content clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-content', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmContent]',
    templateUrl: './content.component.html'
})
export class ContentComponent extends BaseComponent implements OnInit {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
