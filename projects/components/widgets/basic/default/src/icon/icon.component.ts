import { Component, HostBinding, Injector } from '@angular/core';

import { DISPLAY_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './icon.props';

const DEFAULT_CLS = 'app-icon-wrapper';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-icon',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmIcon]',
    templateUrl: './icon.component.html',
    providers: [
        provideAsWidgetRef(IconComponent)
    ]
})
export class IconComponent extends StylableComponent {
    static initializeProps = registerProps();

    public iconclass: any;
    public caption: string;
    @HostBinding('attr.icon-position') iconposition: string;
    @HostBinding('style.fontSize') iconsize: string;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
