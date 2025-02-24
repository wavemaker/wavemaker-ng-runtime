import {Directive, Inject, Injector, Optional} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler, StylableComponent } from '@wm/components/base';

import { registerProps } from './tile.props';

const DEFAULT_CLS = 'app-tile';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-tile', hostClass: DEFAULT_CLS};

@Directive({
  standalone: true,
    selector: '[wmTile]',
    providers: [
        provideAsWidgetRef(TileDirective)
    ]
})
export class TileDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
