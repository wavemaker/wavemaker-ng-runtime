import {Component, HostBinding, Inject, Injector, Optional} from '@angular/core';

import {DISPLAY_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler} from '@wm/components/base';

import {registerProps} from './button.props';

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
    ],
    exportAs: 'wmButton'
})
export class ButtonComponent extends StylableComponent {
    static initializeProps = registerProps();

    public iconurl: string;
    public iconclass: string;
    public caption: string;
    public badgevalue: string;
    public arialabel: string;
    @HostBinding('type') type: string;
    @HostBinding('tabIndex') tabindex: number;
    @HostBinding('disabled') disabled: boolean;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.icon-position') iconposition: string;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this);
    }
}
