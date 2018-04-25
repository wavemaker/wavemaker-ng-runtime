import { Directive, forwardRef, Injector } from '@angular/core';

import { switchClass } from '@wm/core';

import { WidgetRef, IWidgetConfig } from '../../framework/types';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './right-panel.props';

registerProps();

const DEFAULT_CLS = 'app-right-panel';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-right-panel',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmRightPanel]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => RightPanelDirective)}
    ]
})
export class RightPanelDirective extends StylableComponent {

    onPropertyChange(key, nv, ov) {
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, `col-sm-${nv}`, ov ? ` col-sm-${ov}` : '');
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
