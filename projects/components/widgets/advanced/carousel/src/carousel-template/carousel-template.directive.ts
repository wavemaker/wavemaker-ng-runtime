import { Directive, Injector } from '@angular/core';

import { IWidgetConfig, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './carousel-template.props';

const DEFAULT_CLS = 'app-carousel-item';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-carousel-template',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmCarouselTemplate]'
})
export class CarouselTemplateDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
