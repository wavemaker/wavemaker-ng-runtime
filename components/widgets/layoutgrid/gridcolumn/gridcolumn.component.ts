import { Component, OnInit, ElementRef, Injector } from '@angular/core';
import { addClass } from '@utils/dom';
import { BaseComponent } from '../../base/base.component';
import { initWidget } from '../../../utils/init-widget';
import { styler } from '@utils/styler';
import { registerProps } from './gridcolumn.props';

registerProps();

const WIDGET_TYPE = 'wm-gridcolumn';
const DEFAULT_CLS = '';

@Component({
    selector: 'wm-gridcolumn',
    templateUrl: './gridcolumn.component.html',
    styleUrls: ['./gridcolumn.component.less']
})
export class GridcolumnComponent extends BaseComponent implements OnInit {
    height: string;
    padding: string;

    public _columnclass = '';
    public _columnwidth;

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'columnwidth':
                this._columnclass = `col-sm-${nv}`;
                this._columnwidth = nv;
                break;
        }
    }

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
