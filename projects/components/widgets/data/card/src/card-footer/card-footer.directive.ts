import { Directive, Injector } from '@angular/core';

import { IWidgetConfig } from '../../../framework/types';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
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
