import { Directive, HostBinding, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './button-group.props';

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
