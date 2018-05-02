import { Directive, forwardRef, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig, WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './tile.props';

registerProps();

const DEFAULT_CLS = 'app-tile';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-tile', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTile]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => TileDirective)}
    ]
})
export class TileDirective extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
