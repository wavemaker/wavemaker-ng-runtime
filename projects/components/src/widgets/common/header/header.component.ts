import { Component, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './header.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

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

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
