import {Attribute, Directive, Inject, Injector, Optional} from '@angular/core';

import {setCSS, switchClass, Viewport} from '@wm/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler, StylableComponent } from '@wm/components/base';

import { registerProps } from './layout-grid-column.props';

const DEFAULT_CLS = 'app-grid-column';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-gridcolumn',
    hostClass: DEFAULT_CLS
};

@Directive({
  standalone: true,
    selector: '[wmLayoutGridColumn]',
    providers: [
        provideAsWidgetRef(LayoutGridColumnDirective)
    ]
})
export class LayoutGridColumnDirective extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector, @Attribute('height') height, private viewport: Viewport, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    onPropertyChange(key, nv, ov?) {
        const prefix = 'sm';
        if (key === 'columnwidth') {
            if ((this.viewport.isMobileType && !this.getAttr('xscolumnwidth')) || !this.viewport.isMobileType) {
                switchClass(this.nativeElement, `col-${prefix}-${nv}`, ov ? `col-${prefix}-${ov}` : '');
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
