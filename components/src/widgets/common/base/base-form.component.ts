import { ControlValueAccessor } from '@angular/forms';

import { StylableComponent } from './stylable.component';

export abstract class BaseFormComponent extends StylableComponent implements ControlValueAccessor {
    protected datavalue;

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

    protected invokeOnChange(value) {
        this._onChange(value);
    }

    protected invokeOnTouched() {
        this._onTouched();
    }
}