import {Directive, HostBinding, HostListener, Inject, Injector, Optional} from '@angular/core';

import {APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler} from '@wm/components/base';
import {registerProps} from './button-group.props';

const DEFAULT_CLS = 'btn-group app-button-group';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-buttongroup',
    hostClass: DEFAULT_CLS
};

@Directive({
  standalone: true,
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

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
