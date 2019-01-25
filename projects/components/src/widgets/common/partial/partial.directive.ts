import { Directive, Injector } from '@angular/core';

import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './partial.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'app-partial clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-partial', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmPartial]',
    providers: [
        provideAsWidgetRef(PartialDirective)
    ]
})
export class PartialDirective extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}
