import { Component, forwardRef, Injector } from '@angular/core';

import { switchClass } from '@wm/utils';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IStylableComponent } from '../../framework/types';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './right-panel.props';

registerProps();

const DEFAULT_CLS = 'app-right-panel';
const WIDGET_CONFIG = {widgetType: 'wm-right-panel', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmRightPanel]',
    templateUrl: './right-panel.component.html',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => RightPanelComponent)}
    ]
})
export class RightPanelComponent extends BaseComponent {

    onPropertyChange(key, nv, ov) {
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, `col-md-${nv} col-sm-${nv}`, ov ? `col-md-${ov} col-sm-${ov}` : '');
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent, APPLY_STYLES_TYPE.CONTAINER);
    }
}
