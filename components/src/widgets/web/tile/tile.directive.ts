import { Directive, Injector } from '@angular/core';

import { setProperty } from '@wm/utils';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IStylableComponent } from '../../framework/types';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './tile.props';

registerProps();

const DEFAULT_CLS = 'app-tile bg-primary';
const WIDGET_CONFIG = {widgetType: 'wm-tile', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTile]'
})
export class TileDirective extends BaseComponent {

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'caption':
                setProperty(this.nativeElement, 'textContent', nv);
                break;
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent, APPLY_STYLES_TYPE.CONTAINER);
    }

}
