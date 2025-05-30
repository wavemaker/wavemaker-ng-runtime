import {Directive, Inject, Injector, Optional} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler, StylableComponent } from '@wm/components/base';

import { registerProps } from './linear-layout-item.props';

const DEFAULT_CLS = 'app-linear-layout-item clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-linearlayoutitem',
    hostClass: DEFAULT_CLS
};

@Directive({
  standalone: true,
    selector: '[wmLinearLayoutItem]',
    providers: [
        provideAsWidgetRef(LinearLayoutItemDirective)
    ]
})
export class LinearLayoutItemDirective extends StylableComponent {
    static initializeProps = registerProps();
    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        switch (key) {
            case 'flexgrow':
                this.$element.css('flex-grow', nv);
            break;
        }
        super.onPropertyChange(key, nv, ov);
    }
}
