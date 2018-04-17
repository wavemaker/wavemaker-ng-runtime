import { Directive, forwardRef, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { IStylableComponent } from '../../framework/types';
import { registerProps } from './top-nav.props';
import { BaseComponent } from '../base/base.component';

registerProps();

const DEFAULT_CLS = 'app-top-nav';
const WIDGET_CONFIG = {widgetType: 'wm-top-nav', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTopNav]',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => TopNavDirective)}
    ]
})
export class TopNavDirective extends BaseComponent {
    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent);
    }
}
