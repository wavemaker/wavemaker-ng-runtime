import { Directive, forwardRef, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './footer.props';

registerProps();

const DEFAULT_CLS = 'app-footer clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-footer', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmFooter]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => FooterDirective)}
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
