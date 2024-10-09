import {Directive, Inject, Injector, Optional} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './footer.props';

const DEFAULT_CLS = 'app-footer clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-footer',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmFooter]',
    providers: [
        provideAsWidgetRef(FooterDirective)
    ],
    exportAs: 'wmFooter'
})
export class FooterDirective extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
