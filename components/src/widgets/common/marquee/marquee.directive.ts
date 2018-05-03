import { Directive, forwardRef, Injector } from '@angular/core';

import { IWidgetConfig, WidgetRef } from '../../framework/types';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './marquee.props';

registerProps();

const DEFAULT_CLS = 'app-marquee app-container';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-marquee',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmMarquee]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => MarqueeDirective)}
    ]
})
export class MarqueeDirective extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}