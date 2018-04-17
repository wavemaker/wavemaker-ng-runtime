import { Component, HostBinding, Injector } from '@angular/core';

import { styler } from '../base/framework/styler';
import { IStylableComponent, IWidgetConfig } from '../base/framework/types';

import { BaseComponent } from '../base/base.component';
import { registerProps } from './button.props';

registerProps();

const DEFAULT_CLS = 'btn app-button';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-button', hostClass: DEFAULT_CLS};

@Component({
    selector: 'button[wmButton]',
    templateUrl: './button.component.html'
})
export class ButtonComponent extends BaseComponent {

    @HostBinding('type') type: string = 'button';
    @HostBinding('tabIndex') tabindex: number;
    @HostBinding('disabled') disabled: boolean;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.icon-position') iconposition: string;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this as IStylableComponent);
    }
}
