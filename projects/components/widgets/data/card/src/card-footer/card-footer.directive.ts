import { Directive, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './card-footer.props';

const DEFAULT_CLS = 'app-card-footer text-muted card-footer';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-card-footer',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmCardFooter]'
})
export class CardFooterDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
