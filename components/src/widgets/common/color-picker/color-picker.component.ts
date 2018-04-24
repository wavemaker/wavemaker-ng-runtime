import { Component, forwardRef, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { BaseFormComponent } from '../base/base-form.component';
import { registerProps } from './color-picker.props';
import { getControlValueAccessor, invokeEventHandler } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'input-group app-colorpicker';
const WIDGET_CONFIG = {widgetType: 'wm-colorpicker', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmColorPicker]',
    templateUrl: './color-picker.component.html',
    providers: [
        getControlValueAccessor(ColorPickerComponent),
        {provide: WidgetRef, useExisting: forwardRef(() => ColorPickerComponent)}
    ]
})
export class ColorPickerComponent extends BaseFormComponent {

    oldVal;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    onChange($event) {
        invokeEventHandler(this, 'change', {$event, newVal: $event, oldVal: this.oldVal});
        this.oldVal = $event;
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
    }
}

 // Todo - Vinay -- Events
