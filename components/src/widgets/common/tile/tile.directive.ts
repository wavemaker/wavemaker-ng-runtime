import { Directive, forwardRef, Injector } from '@angular/core';

import { setProperty } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './tile.props';

registerProps();

const DEFAULT_CLS = 'app-tile bg-primary';
const WIDGET_CONFIG = {widgetType: 'wm-tile', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTile]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => TileDirective)}
    ]
})
export class TileDirective extends StylableComponent {

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'caption':
                setProperty(this.nativeElement, 'textContent', nv);
                break;
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
