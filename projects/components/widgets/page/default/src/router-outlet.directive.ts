import {Directive, Injector, Optional} from '@angular/core';

import {switchClass} from '@wm/core';

import { IWidgetConfig, provideAsWidgetRef, StylableComponent } from '@wm/components/base';
import { registerProps } from './router-outlet.props';

const DEFAULT_CLS = 'app-content-column-wrapper';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-router-outlet',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmRouterOutlet]',
    providers: [
        provideAsWidgetRef(RouterOutletDirective)
    ]
})
export class RouterOutletDirective extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, `col-md-${nv} col-sm-${nv}`, `col-md-${ov} col-sm-${ov}`);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
