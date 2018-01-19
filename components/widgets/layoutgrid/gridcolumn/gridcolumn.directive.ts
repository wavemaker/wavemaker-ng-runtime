import { OnInit, ElementRef, Injector, Directive } from '@angular/core';
import { addClass, switchClass } from '@utils/dom';
import { BaseComponent } from '../../base/base.component';
import { initWidget } from '../../../utils/init-widget';
import { styler } from '@utils/styler';
import { registerProps } from './gridcolumn.props';

registerProps();

const WIDGET_TYPE = 'wm-gridcolumn';
const DEFAULT_CLS = 'app-grid-column';

@Directive({
    selector: '[wmGridcolumn]'
})
export class GridcolumnDirective extends BaseComponent implements OnInit {


    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'columnwidth':
                switchClass(this.$element, `col-sm-${nv}`, ov ? `col-sm-${ov}` : '');
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
