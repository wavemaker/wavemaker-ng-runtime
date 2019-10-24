import { Component, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './header.props';

const DEFAULT_CLS = 'app-header clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-header',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmHeader]',
    templateUrl: './header.component.html',
    providers: [
        provideAsWidgetRef(HeaderComponent)
    ]
})
export class HeaderComponent extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
