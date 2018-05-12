import { Directive, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './footer.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-footer clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-footer',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmFooter]',
    providers: [
        provideAsWidgetRef(FooterDirective)
    ]
})
export class FooterDirective extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}

// Todo - Vinay -- layout for mobile
// element.scope().layout.footer = true;
