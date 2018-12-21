import { Directive, Injector } from '@angular/core';

import { IWidgetConfig } from '../../../framework/types';
import { styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './carousel-template.props';

registerProps();

const DEFAULT_CLS = 'app-carousel-item';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-carousel-template',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmCarouselTemplate]'
})
export class CarouselTemplateDirective extends StylableComponent {
    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
