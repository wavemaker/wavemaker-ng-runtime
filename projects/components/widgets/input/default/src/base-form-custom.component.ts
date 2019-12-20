import { ControlValueAccessor, FormControlName } from '@angular/forms';
import { OnInit } from '@angular/core';

import { BaseFormComponent } from './base-form.component';

export abstract class BaseFormCustomComponent extends BaseFormComponent implements ControlValueAccessor, OnInit {

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
    }

    public invokeOnChange(value, $event?: Event | any, valid?: boolean) {
        // let the angular know about the change
        this._onChange(value);

        if (valid) {
            super.invokeOnChange(value, $event);
        }
    }

    public invokeOnTouched($event?: Event) {
        this._onTouched();

        if ($event) {
            this.invokeEventCallback('blur', {$event});
        }
    }

    protected invokeOnFocus($event: Event) {
        this.invokeEventCallback('focus', {$event});
    }
}
