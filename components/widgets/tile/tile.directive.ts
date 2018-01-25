import { Directive, ElementRef, Injector, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './tile.props';
import { addClass, setProperty } from '@utils/dom';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-tile', hasTemplate: false};
const DEFAULT_CLS = 'app-tile bg-primary';

@Directive({
    'selector': '[wmTile]'
})
export class TileDirective extends BaseComponent {

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'caption':
                setProperty(this.$element, 'textContent', nv);
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }

}
