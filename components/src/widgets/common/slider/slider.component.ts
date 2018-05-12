import { Component, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { registerProps } from './slider.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';

const DEFAULT_CLS = 'app-slider slider';
const WIDGET_CONFIG = {widgetType: 'wm-slider', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmSlider]',
    templateUrl: './slider.component.html',
    providers: [
        provideAsNgValueAccessor(SliderComponent),
        provideAsWidgetRef(SliderComponent)
    ]
})
export class SliderComponent extends BaseFormCustomComponent {

    oldVal;
    datavalue;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    onChange($event) {
        this.invokeEventCallback('change', {$event, newVal: this.datavalue, oldVal: this.oldVal});
        this.oldVal = this.datavalue;
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
    }
}
