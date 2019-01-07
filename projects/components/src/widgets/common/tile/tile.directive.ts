import { Directive, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './tile.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-tile';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-tile', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTile]',
    providers: [
        provideAsWidgetRef(TileDirective)
    ]
})
export class TileDirective extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
