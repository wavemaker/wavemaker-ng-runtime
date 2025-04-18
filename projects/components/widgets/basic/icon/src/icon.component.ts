import {Component, HostBinding, Inject, Injector, Optional} from '@angular/core';

import {IWidgetConfig, provideAsWidgetRef, StylableComponent, styler, TextContentDirective} from '@wm/components/base';
import {registerProps} from './icon.props';

const DEFAULT_CLS = 'app-icon-wrapper';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-icon',
    hostClass: DEFAULT_CLS
};

@Component({
    standalone: true,
    imports: [TextContentDirective],
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
    public hint: string;
    public arialabel: string;
    @HostBinding('attr.icon-position') iconposition: string;
    @HostBinding('style.fontSize') iconsize: string;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this);
    }
}
