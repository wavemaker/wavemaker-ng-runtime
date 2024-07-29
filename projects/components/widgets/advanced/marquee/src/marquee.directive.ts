import {Directive, Inject, Injector, Optional} from '@angular/core';

import { IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './marquee.props';

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

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this);
    }
}
