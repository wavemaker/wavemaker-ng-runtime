import {Component, Inject, Injector, Optional} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './header.props';

const DEFAULT_CLS = 'app-header clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-header',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmHeader]',
    standalone: false,
    templateUrl: './header.component.html',
    providers: [
        provideAsWidgetRef(HeaderComponent)
    ],
    exportAs: 'wmHeader'
})
export class HeaderComponent extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
