import { Component, HostBinding, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { DISPLAY_TYPE } from '../../framework/constants';
import { registerProps } from './button.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

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
