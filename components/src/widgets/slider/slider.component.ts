import { Component, forwardRef, Injector } from '@angular/core';

import { styler } from '../base/framework/styler';
import { BaseFormComponent } from '../base/base-form.component';
import { IStylableComponent } from '../base/framework/types';
import { registerProps } from './slider.props';
import { getControlValueAccessor, invokeEventHandler } from '../../utils/widget-utils';

const DEFAULT_CLS = 'app-slider slider';
const WIDGET_CONFIG = {widgetType: 'wm-slider', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmSlider]',
    templateUrl: './slider.component.html',
    providers: [getControlValueAccessor(SliderComponent), {
        provide: '@Widget', useExisting: forwardRef(() => SliderComponent)
    }]
})
export class SliderComponent extends BaseFormComponent {

    oldVal;
    datavalue;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this as IStylableComponent);
    }

    onChange($event) {
        invokeEventHandler(this, 'change', {$event, newVal: this.datavalue, oldVal: this.oldVal});
        this.oldVal = this.datavalue;
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
    }
}
