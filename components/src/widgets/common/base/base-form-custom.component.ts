import { ControlValueAccessor } from '@angular/forms';

import { BaseFormComponent } from './base-form.component';

export abstract class BaseFormCustomComponent extends BaseFormComponent implements ControlValueAccessor {

    private _onChange: any = () => {};
    private _onTouched: any = () => {};

    public registerOnChange(fn) {
        this._onChange = fn;
    }

    public registerOnTouched(fn) {
        this._onTouched = fn;
    }

    public writeValue(value) {
        if (this.hasOwnProperty('formControlName')) {
            this.widget.datavalue = value;
            this.updatePrevDatavalue(value);
        }
    }

    protected invokeOnChange(value, $event?: Event | any, valid?: boolean) {
        // let the angular know about the change
        this._onChange(value);

        if (valid) {
            super.invokeOnChange(value, $event);
        }
    }

    protected invokeOnTouched($event?: Event) {
        this._onTouched();

        if ($event) {
            this.invokeEventCallback('blur', {$event});
        }
    }
}