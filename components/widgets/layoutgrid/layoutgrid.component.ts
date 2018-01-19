import { Component, OnInit, ElementRef, Injector, ChangeDetectorRef } from '@angular/core';
import { addClass } from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { initWidget } from '../../utils/init-widget';
import { styler } from '@utils/styler';
import { registerProps } from './layoutgrid.props';

registerProps();

const WIDGET_TYPE = 'wm-layoutgrid';
const DEFAULT_CLS = '';

@Component({
    selector: 'wm-layoutgrid',
    templateUrl: './layoutgrid.component.html',
    styleUrls: ['./layoutgrid.component.less']
})
export class LayoutgridComponent extends BaseComponent implements OnInit {

    class = '';

    constructor(inj: Injector, elRef: ElementRef, private cdRef: ChangeDetectorRef) {
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
