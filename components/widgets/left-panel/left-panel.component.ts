import { Component, ElementRef, Injector, ChangeDetectorRef, forwardRef } from '@angular/core';
import { BaseComponent } from '../../widgets/base/base.component';
import { registerProps } from './left-panel.props';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { addClass } from '@utils/dom';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-left-panel', hasTemplate: true};

@Component({
    selector: 'wm-left-panel',
    templateUrl: './left-panel.component.html',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => LeftPanelComponent)}
    ]
})
export class LeftPanelComponent extends BaseComponent {

    onPropertyChange(key, nv, ov) {
        if (key === 'columnwidth') {
            addClass(this.$host, `col-md-${nv} col-sm-${nv}`);
        }
    }

    constructor(inj: Injector, elRef: ElementRef, private cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$host, 'app-left-panel');
    }

    _ngOnInit() {
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
