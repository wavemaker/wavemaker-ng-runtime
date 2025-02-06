import { Component, Inject, Injector, Optional } from '@angular/core';
import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler, WmComponentsModule } from '@wm/components/base';
import { registerProps } from './header.props';
import { CommonModule } from '@angular/common';

const DEFAULT_CLS = 'app-header clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-header',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmHeader]',
    templateUrl: './header.component.html',
    providers: [
        provideAsWidgetRef(HeaderComponent)
    ],
    exportAs: 'wmHeader',
    standalone: true,
    imports: [CommonModule, WmComponentsModule],
})
export class HeaderComponent extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
