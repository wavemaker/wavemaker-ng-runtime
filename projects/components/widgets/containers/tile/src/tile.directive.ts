import {Directive, Injector, Optional} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler, StylableComponent } from '@wm/components/base';

import { registerProps } from './tile.props';
import {UserDefinedExecutionContext} from '@wm/core';

const DEFAULT_CLS = 'app-tile';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-tile', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTile]',
    providers: [
        provideAsWidgetRef(TileDirective)
    ]
})
export class TileDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
