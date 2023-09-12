import {Directive, Injector, Optional} from '@angular/core';

import { provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './top-nav.props';
import {UserDefinedExecutionContext} from '@wm/core';

const DEFAULT_CLS = 'app-top-nav';
const WIDGET_CONFIG = {widgetType: 'wm-top-nav', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTopNav]',
    providers: [
        provideAsWidgetRef(TopNavDirective)
    ],
    exportAs: 'wmTopNav'
})
export class TopNavDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);

        styler(this.nativeElement, this);
    }
}
