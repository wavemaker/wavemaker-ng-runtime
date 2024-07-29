import {Directive, Inject, Injector, Optional} from '@angular/core';

import {switchClass} from '@wm/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './right-panel.props';

const DEFAULT_CLS = 'app-right-panel';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-right-panel',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmRightPanel]',
    providers: [
        provideAsWidgetRef(RightPanelDirective)
    ],
    exportAs: 'wmRightPanel'
})
export class RightPanelDirective extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, `col-sm-${nv}`, ov ? ` col-sm-${ov}` : '');
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
