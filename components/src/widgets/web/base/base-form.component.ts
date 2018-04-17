import { ControlValueAccessor } from '@angular/forms';

import { BaseComponent } from './base.component';
import { IWidgetConfig } from '../../framework/types';

export abstract class BaseFormComponent extends BaseComponent implements ControlValueAccessor {
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

    constructor (inj: any, widgetConfig: IWidgetConfig) {
        super(inj, widgetConfig);
    }
}