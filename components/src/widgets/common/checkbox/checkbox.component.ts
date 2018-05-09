import { Component, forwardRef, Injector, OnInit } from '@angular/core';

import { isDefined, toggleClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { BaseFormComponent } from '../base/base-form.component';
import { getControlValueAccessor } from '../../../utils/widget-utils';
import { registerProps } from './checkbox.props';

const DEFAULT_CLS = 'app-checkbox checkbox';
const WIDGET_CONFIG = {widgetType: 'wm-checkbox', hostClass: DEFAULT_CLS};

registerProps();

const unStringify = val => {
    if (val === 'true') {
        return true;
    }
    if (val === 'false') {
        return false;
    }
    if (!isNaN(parseInt(val, 10))) {
        return parseInt(val, 10);
    }
    return val;
};

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
    checkedvalue;
    /**
     * This property defines the value of the widget when the element is in the unchecked state.
     */
    uncheckedvalue;

    private _checkedvalue;
    private _uncheckedvalue;
    private _caption = '&nbsp';

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

    set datavalue(value: boolean | string | number) {
        value = unStringify(value);
        if ((isDefined(this._checkedvalue) && this._checkedvalue === value) || value === true) {
            this.model = true;
        } else {
            this.model = false;
        }
        this.invokeOnChange(this.datavalue);
    }

    getComputedDataValue(modelValue) {
        if (isDefined(this._checkedvalue) && modelValue) {
            return this._checkedvalue;
        }
        if (isDefined(this._uncheckedvalue) && !modelValue) {
            return this._uncheckedvalue;
        }
        return modelValue;
    }

    isUnchecked() {
        return !this.model;
    }

    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'type':
                toggleClass(this.nativeElement, 'app-toggle', nv === 'toggle');
                break;
            case 'caption':
                if (!isDefined(nv) || nv === '') {
                    this._caption = '&nbsp;';
                } else {
                    this._caption = nv;
                }
                break;
            case 'checkedvalue':
                this._checkedvalue = unStringify(nv);
                break;
            case 'uncheckedvalue':
                this._uncheckedvalue = unStringify(nv);
                break;
        }
    }

    onChange($event) {
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
        this.invokeEventCallback('change', {$event: $event, newVal: this.datavalue, oldVal: this.getComputedDataValue(!this.model)});
    }
}
