import { Directive, HostBinding, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './button-group.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'btn-group app-button-group';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-buttongroup',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmButtonGroup]',
    providers: [
        provideAsWidgetRef(ButtonGroupDirective)
    ]
})
export class ButtonGroupDirective extends StylableComponent {
    static initializeProps = registerProps();
    @HostBinding('class.btn-group-vertical') vertical: boolean;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
