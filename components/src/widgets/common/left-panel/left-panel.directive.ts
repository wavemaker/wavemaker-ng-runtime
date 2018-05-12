import { Directive, Injector } from '@angular/core';

import { switchClass, toggleClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './left-panel.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-left-panel';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-left-panel',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmLeftPanel]',
    providers: [
        provideAsWidgetRef(LeftPanelDirective)
    ]
})
export class LeftPanelDirective extends StylableComponent {

    onPropertyChange(key, nv, ov) {
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, `col-sm-${nv}`, ov ? `col-sm-${ov}` : '');
        } else if (key === 'expanded') {
            toggleClass(this.nativeElement, 'left-panel-expanded', nv);
            toggleClass(this.nativeElement, 'left-panel-collapsed', !nv);
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}


// Todo vinay -- incomplete.. animations.
// Todo DeviceView