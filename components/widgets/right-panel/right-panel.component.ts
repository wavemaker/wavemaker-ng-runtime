import { Component, ElementRef, Injector, ChangeDetectorRef, forwardRef } from '@angular/core';
import { BaseComponent } from '../../widgets/base/base.component';
import { registerProps } from './right-panel.props';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { addClass, } from '@utils/dom';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-right-panel', hasTemplate: true};

@Component({
    selector: 'wm-right-panel',
    templateUrl: './right-panel.component.html',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => RightPanelComponent)}
    ]
})
export class RightPanelComponent extends BaseComponent {

    onPropertyChange(key, nv, ov) {
        if (key === 'columnwidth') {
            addClass(this.$host, `col-md-${nv} col-sm-${nv}`);
        }
    }

    constructor(inj: Injector, elRef: ElementRef, private cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$host, 'app-right-panel');
    }

    _ngOnInit() {
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
