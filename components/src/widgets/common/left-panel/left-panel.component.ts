import { Component, forwardRef, Injector } from '@angular/core';

import { switchClass, toggleClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './left-panel.props';

registerProps();

const DEFAULT_CLS = 'app-left-panel';
const WIDGET_CONFIG = {widgetType: 'wm-left-panel', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmLeftPanel]',
    templateUrl: './left-panel.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => LeftPanelComponent)}
    ]
})
export class LeftPanelComponent extends StylableComponent {

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


//Todo vinay -- incomplete.. animations.