import { Directive, Injector } from '@angular/core';

import { IWidgetConfig } from '../../framework/types';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './marquee.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'app-marquee app-container';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-marquee',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmMarquee]',
    providers: [
        provideAsWidgetRef(MarqueeDirective)
    ]
})
export class MarqueeDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
