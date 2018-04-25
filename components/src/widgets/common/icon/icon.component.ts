import { Component, forwardRef, HostBinding, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig, WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './icon.props';

registerProps();

const DEFAULT_CLS = 'app-icon-wrapper';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-icon',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmIcon]',
    templateUrl: './icon.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => IconComponent)}
    ]
})
export class IconComponent extends StylableComponent {

    @HostBinding('attr.icon-position') iconposition: string;
    @HostBinding('style.fontSize') iconsize: string;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
