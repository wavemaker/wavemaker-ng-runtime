import { Attribute, Directive, Injector } from '@angular/core';

import { isMobileApp, setCSS, switchClass, Viewport } from '@wm/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler, StylableComponent } from '@wm/components/base';

import { registerProps } from './layout-grid-column.props';

const DEFAULT_CLS = 'app-grid-column';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-gridcolumn',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmLayoutGridColumn]',
    providers: [
        provideAsWidgetRef(LayoutGridColumnDirective)
    ]
})
export class LayoutGridColumnDirective extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector, @Attribute('height') height, private viewport: Viewport) {
        super(inj, WIDGET_CONFIG);

        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    onPropertyChange(key, nv, ov?) {
        const prefix = this.viewport.isMobileType ? 'xs' : 'sm';
        if (key === 'xscolumnwidth' && this.viewport.isMobileType) {
            switchClass(this.nativeElement, `col-${prefix}-${nv}`, ov ? `col-${prefix}-${ov}` : '');
        } else if (key === 'columnwidth') {
            if ((this.viewport.isMobileType && !this.getAttr('xscolumnwidth')) || !this.viewport.isMobileType) {
                switchClass(this.nativeElement, `col-${prefix}-${nv}`, ov ? `col-${prefix}-${ov}` : '');
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
