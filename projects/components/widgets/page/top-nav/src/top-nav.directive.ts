import {Directive, Inject, Injector, Optional} from '@angular/core';

import { provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './top-nav.props';

const DEFAULT_CLS = 'app-top-nav';
const WIDGET_CONFIG = {widgetType: 'wm-top-nav', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTopNav]',
    standalone: false,
    providers: [
        provideAsWidgetRef(TopNavDirective)
    ],
    exportAs: 'wmTopNav'
})
export class TopNavDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this);
    }
}
