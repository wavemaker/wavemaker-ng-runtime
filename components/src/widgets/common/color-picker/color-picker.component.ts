import { Component, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { registerProps } from './color-picker.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';

const DEFAULT_CLS = 'input-group app-colorpicker';
const WIDGET_CONFIG = {widgetType: 'wm-colorpicker', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmColorPicker]',
    templateUrl: './color-picker.component.html',
    providers: [
        provideAsNgValueAccessor(ColorPickerComponent),
        provideAsWidgetRef(ColorPickerComponent)
    ]
})
export class ColorPickerComponent extends BaseFormCustomComponent {

    oldVal;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    onChange($event) {
        this.invokeEventCallback('change', {$event, newVal: $event, oldVal: this.oldVal});
        this.oldVal = $event;
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
    }
}

 // Todo - Vinay -- Events
