import { Component, ElementRef, Injector, ChangeDetectorRef, forwardRef } from '@angular/core';
import { BaseComponent } from '../../widgets/base/base.component';
import { registerProps } from './right-panel.props';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { switchClass } from '@utils/dom';

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
            switchClass(this.$element, `col-md-${nv} col-sm-${nv}`, ov ? `col-md-${ov} col-sm-${ov}`: '');
        }
    }

    constructor(inj: Injector, elRef: ElementRef, private cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
