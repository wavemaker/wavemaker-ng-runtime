import { Directive, Injector } from '@angular/core';

import { addClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './container.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'app-container';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-container',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmContainer]',
    providers: [
        provideAsWidgetRef(ContainerDirective)
    ]
})
export class ContainerDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        addClass(this.nativeElement, DEFAULT_CLS);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
