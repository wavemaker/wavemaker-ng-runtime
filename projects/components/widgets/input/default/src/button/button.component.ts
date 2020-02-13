import { Component, HostBinding, Injector } from '@angular/core';

import { DISPLAY_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './button.props';

const DEFAULT_CLS = 'btn app-button';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-button',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};

@Component({
    selector: 'button[wmButton]',
    templateUrl: './button.component.html',
    providers: [
        provideAsWidgetRef(ButtonComponent)
    ]
})
export class ButtonComponent extends StylableComponent {
    static initializeProps = registerProps();

    public iconurl: string;
    public iconclass: string;
    public caption: string;
    public badgevalue: string;
    @HostBinding('type') type: string;
    @HostBinding('tabIndex') tabindex: number;
    @HostBinding('disabled') disabled: boolean;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.icon-position') iconposition: string;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
