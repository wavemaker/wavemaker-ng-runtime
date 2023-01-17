import {Directive, HostBinding, HostListener, Injector, Optional} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './button-group.props';
import {UserDefinedExecutionContext} from '@wm/core';

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
    @HostListener('click', ['$event']) handleClick(event) {
        const $target = $(event.target).closest('.app-button');
        this.$element.find('.app-button').removeClass('selected');
        $target.addClass('selected');
    }

    constructor(inj: Injector, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
