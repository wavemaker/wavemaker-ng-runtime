import { ChangeDetectorRef, Component, ElementRef, forwardRef, Injector } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './left-panel.props';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { switchClass, toggleClass } from '@wm/utils';

registerProps();

const DEFAULT_CLS = 'app-left-panel';
const WIDGET_CONFIG = {widgetType: 'wm-left-panel', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmLeftPanel]',
    templateUrl: './left-panel.component.html',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => LeftPanelComponent)}
    ]
})
export class LeftPanelComponent extends BaseComponent {

    onPropertyChange(key, nv, ov) {
        if (key === 'columnwidth') {
            switchClass(this.$element, `col-md-${nv} col-sm-${nv}`, ov ? `col-md-${ov} col-sm-${ov}` : '');
        } else if (key === 'expanded') {
            toggleClass(this.$element, 'left-panel-expanded', nv);
            toggleClass(this.$element, 'left-panel-collapsed', !nv);
        }
    }

    constructor(inj: Injector, elRef: ElementRef, private cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
