import { Directive, forwardRef, Injector } from '@angular/core';

import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './partial.props';

registerProps();

const DEFAULT_CLS = 'app-partial clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-partial', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmPartial]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => PartialDirective)}
    ]
})
export class PartialDirective extends StylableComponent {
    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}
