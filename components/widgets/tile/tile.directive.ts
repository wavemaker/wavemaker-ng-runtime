import { Directive, ElementRef, Injector, ChangeDetectorRef, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './tile.props';
import { addClass, setProperty } from '@utils/dom';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';

registerProps();

const DEFAULT_CLS = 'app-tile bg-primary';
const WIDGET_CONFIG = {widgetType: 'wm-tile', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTile]'
})
export class TileDirective extends BaseComponent implements OnInit {

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'caption':
                setProperty(this.$element, 'textContent', nv);
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
