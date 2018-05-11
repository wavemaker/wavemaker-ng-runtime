import { Component, forwardRef, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { registerProps } from './slider.props';
import { getControlValueAccessor } from '../../../utils/widget-utils';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';

const DEFAULT_CLS = 'app-slider slider';
const WIDGET_CONFIG = {widgetType: 'wm-slider', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmSlider]',
    templateUrl: './slider.component.html',
    providers: [
        getControlValueAccessor(SliderComponent),
        {provide: WidgetRef, useExisting: forwardRef(() => SliderComponent)}
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
