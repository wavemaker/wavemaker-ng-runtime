import { Component, OnInit, ElementRef, Injector } from '@angular/core';
import { addClass } from '@utils/dom';
import { BaseComponent } from '../..//base/base.component';
import { initWidget } from '../../../utils/init-widget';
import { styler } from '@utils/styler';
import { registerProps } from './gridrow.props';

registerProps();

const WIDGET_TYPE = 'wm-gridrow';
const DEFAULT_CLS = '';

@Component({
    selector: 'wm-gridrow',
    templateUrl: './gridrow.component.html',
    styleUrls: ['./gridrow.component.less']
})
export class GridrowComponent extends BaseComponent implements OnInit {

    class = '';

    constructor(inj: Injector, elRef: ElementRef) {
        super();

        this.$host = elRef.nativeElement;
        this.$element = this.$host;

        addClass(this.$element, DEFAULT_CLS);

        initWidget(this, WIDGET_TYPE, (<any>inj).elDef, (<any>inj).view);
        styler(this.$element, this);
    }

    ngOnInit() {
    }

}
