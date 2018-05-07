import { Component, forwardRef, Injector, OnInit } from '@angular/core';

import { toggleClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { BaseFormComponent } from '../base/base-form.component';
import { getControlValueAccessor } from '../../../utils/widget-utils';
import { registerProps } from './checkbox.props';

const DEFAULT_CLS = 'app-checkbox checkbox';
const WIDGET_CONFIG = {widgetType: 'wm-checkbox', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmCheckbox]',
    templateUrl: './checkbox.component.html',
    providers: [
        getControlValueAccessor(CheckboxComponent),
        {provide: WidgetRef, useExisting: forwardRef(() => CheckboxComponent)}
    ]
})
export class CheckboxComponent  extends BaseFormComponent implements OnInit {

    model: boolean;
    /**
     * This property defines the value of the widget when the element is in the checked state. Default value is boolean value true. If specified, the value will be of string type
     */
    checkedvalue: string;
    /**
     * This property defines the value of the widget when the element is in the unchecked state.
     */
    uncheckedvalue: string;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    ngOnInit() {
        super.ngOnInit();
        // Apply styles on the inner label node
        styler(this.nativeElement.querySelector('label'), this);
    }

    get datavalue(){
        return this.getComputedDataValue(this.model);
    }

    set datavalue(value: boolean | string) {
        if ((this.checkedvalue && this.checkedvalue === value) || value === true) {
            this.model = true;
        } else {
            this.model = false;
        }
        this.invokeOnChange(this.datavalue);
    }

    getComputedDataValue(modelValue) {
        if (this.checkedvalue && modelValue) {
            return this.checkedvalue;
        } else if (this.uncheckedvalue && !modelValue) {
            return this.uncheckedvalue;
        }
        return modelValue;
    }

    onPropertyChange(key, nv, ov) {
        if (key === 'type') {
            toggleClass(this.nativeElement, 'app-toggle', nv === 'toggle');
        }
    }

    onChange($event) {
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
        this.invokeEventCallback('change', {$event: $event, newVal: this.datavalue, oldVal: this.getComputedDataValue(!this.model)});
    }
}
