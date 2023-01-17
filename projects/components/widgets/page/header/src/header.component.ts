import {Component, Injector, Optional} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './header.props';
import {UserDefinedExecutionContext} from '@wm/core';

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
    ],
    exportAs: 'wmHeader'
})
export class HeaderComponent extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
