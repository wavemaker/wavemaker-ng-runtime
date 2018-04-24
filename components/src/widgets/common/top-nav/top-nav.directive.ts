import { Directive, forwardRef, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { registerProps } from './top-nav.props';
import { StylableComponent } from '../base/stylable.component';

registerProps();

const DEFAULT_CLS = 'app-top-nav';
const WIDGET_CONFIG = {widgetType: 'wm-top-nav', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTopNav]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => TopNavDirective)}
    ]
})
export class TopNavDirective extends StylableComponent {
    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
