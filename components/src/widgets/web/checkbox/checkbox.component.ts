import { Component, forwardRef, Injector, OnInit } from '@angular/core';

import { toggleClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { BaseFormComponent } from '../base/base-form.component';
import { getControlValueAccessor, invokeEventHandler } from '../../../utils/widget-utils';
import { registerProps } from './checkbox.props';

const DEFAULT_CLS = 'app-checkbox checkbox';
const WIDGET_CONFIG = {widgetType: 'wm-checkbox', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmCheckbox]',
    templateUrl: './checkbox.component.html',
    providers: [getControlValueAccessor(CheckboxComponent), {
        provide: '@Widget', useExisting: forwardRef(() => CheckboxComponent)
    }]
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

    get datavalue(){
        return this.getComputedDataValue(this.model);
    }

    getComputedDataValue(modelValue) {
        if (this.checkedvalue && modelValue) {
            return this.checkedvalue;
        } else if (this.uncheckedvalue && !modelValue) {
            return this.uncheckedvalue;
        }
        return modelValue;
    }

    set datavalue(value: boolean | string) {
        if ((this.checkedvalue && this.checkedvalue === value) || value === true) {
            this.model = true;
        } else {
            this.model = false;
        }
        this.invokeOnChange(this.datavalue);
    }

    onPropertyChange(key, nv, ov) {
        if (key === 'type') {
            toggleClass(this.nativeElement, 'app-toggle', nv === 'toggle');
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement.querySelector('label'), this);
    }

    onChange($event) {
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
        $event.stopPropagation();
        invokeEventHandler(this, 'change', {$event: $event, newVal: this.datavalue, oldVal: this.getComputedDataValue(!this.model)});
    }
}
