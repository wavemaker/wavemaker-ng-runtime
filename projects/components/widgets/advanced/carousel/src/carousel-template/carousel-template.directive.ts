import {Directive, Inject, Injector, Optional} from '@angular/core';

import {IWidgetConfig, StylableComponent, styler} from '@wm/components/base';
import {registerProps} from './carousel-template.props';

const DEFAULT_CLS = 'app-carousel-item';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-carousel-template',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmCarouselTemplate]',
    exportAs: 'carouselTemplateRef',
})
export class CarouselTemplateDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this);
    }
}
