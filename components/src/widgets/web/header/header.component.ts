import { Component, forwardRef, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './header.props';

registerProps();

const DEFAULT_CLS = 'app-header clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-header', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmHeader]',
    templateUrl: './header.component.html',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => HeaderComponent)}
    ]
})
export class HeaderComponent extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
