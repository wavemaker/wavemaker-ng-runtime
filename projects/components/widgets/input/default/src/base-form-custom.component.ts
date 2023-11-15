import { ControlValueAccessor, FormControlName, Validator, ValidatorFn, AbstractControl } from '@angular/forms';
import { Injectable, OnInit } from '@angular/core';

import { BaseFormComponent } from './base-form.component';

/*
 * WMS-18269
 * custom 'required' validator for components,
 * as the bound values are resolved at runtime
 * Called on 'required' property change
 *
 * Note: Component needs NG_VALIDATOR provider for this to work
 */
function isValidValue(val): Boolean {
    switch(typeof val) {
        case 'object': return (!!val && (!!val.length || !!Object.keys(val).length));
        case 'number': return (!!val || val === 0);
            default: return !(val === undefined || val === null || val === '');
    }
}
function validateRequiredBind(required: boolean): ValidatorFn {
    return (control: AbstractControl) =>
        required
            ? (isValidValue(control.value)
                ? null
                : { required: true })
            : null;
}

@Injectable()
export abstract class BaseFormCustomComponent extends BaseFormComponent implements ControlValueAccessor, OnInit, Validator {

    private _formControl: FormControlName;
    protected _onChange: any = () => {};
    private _onTouched: any = () => {};

    ngOnInit() {
        super.ngOnInit();
        this._formControl = this.inj.get(FormControlName, null);
    }

    public registerOnChange(fn) {
        this._onChange = fn;
    }

    public registerOnTouched(fn) {
        this._onTouched = fn;
    }

    public writeValue(value) {
        if (this.isDestroyed) {
            return;
        }
        if (this._formControl) {
            this.datavalue = value;
            this.onPropertyChange('datavalue', value);
            this.updatePrevDatavalue(value);
        }
        /*
         * WMS:18246
         * Call onChange on default value, so that the Component Model is updated
         * Do only When the Model Value is different from datavalue
         */
        (value!==this.datavalue) && this._onChange(this.datavalue);
    }

    public invokeOnChange(value, $event?: Event | any, valid?: boolean) {
        // let the angular know about the change
        this._onChange(value);
        if ($event) {
            super.invokeOnChange(value, $event);
        }
    }

    public invokeOnTouched($event?: Event) {
        this._onTouched();

        if ($event) {
            this.invokeEventCallback('blur', {$event});
        }
    }

    public invokeOnFocus($event: Event) {
        this.invokeEventCallback('focus', {$event});
    }
    /* WMS-18269 */
    validate(control: AbstractControl):{[key: string]:any} {
        return this['show'] ? validateRequiredBind(this['required'])(control) : null;
    }
}
