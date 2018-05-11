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
        this.datavalue = value;
    }

    protected invokeOnChange(value, $event?: Event) {
        // let the angular know about the change
        this._onChange(value);

        super.invokeOnChange(value, $event);
    }

    protected invokeOnTouched() {
        this._onTouched();
    }
}