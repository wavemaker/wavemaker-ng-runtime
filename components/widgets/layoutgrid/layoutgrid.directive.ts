import { OnInit, ElementRef, Injector, Directive, ChangeDetectorRef } from '@angular/core';
import { addClass } from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { initWidget } from '../../utils/init-widget';
import { styler } from '@utils/styler';
import { registerProps } from './layoutgrid.props';
import { debounce } from '@utils/utils';

registerProps();

const WIDGET_TYPE = 'wm-layoutgrid';
const DEFAULT_CLS = 'app-grid-layout clearfix';

@Directive({
    selector: '[wmLayoutgrid]'
})
export class LayoutgridDirective extends BaseComponent implements OnInit {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(elRef.nativeElement, elRef.nativeElement, cdr);

        addClass(this.$element, DEFAULT_CLS);

        initWidget(this, WIDGET_TYPE, (<any>inj).elDef, (<any>inj).view);
        styler(this.$element, this);
    }

    ngOnInit() {
    }

}
