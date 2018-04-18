import { Component, HostBinding, Injector } from '@angular/core';

import { styler } from '../../framework/styler';

import { registerProps } from './button.props';
import { StylableComponent } from '../base/stylable.component';

registerProps();

const DEFAULT_CLS = 'btn app-button';
const WIDGET_CONFIG = {widgetType: 'wm-button', hostClass: DEFAULT_CLS};

@Component({
    selector: 'button[wmButton]',
    templateUrl: './button.component.html'
})
export class ButtonComponent extends StylableComponent {

    @HostBinding('type') type: string = 'button';
    @HostBinding('tabIndex') tabindex: number;
    @HostBinding('disabled') disabled: boolean;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.icon-position') iconposition: string;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}


// Todo - Vinay iconsrc -- Utils.getImageUrl