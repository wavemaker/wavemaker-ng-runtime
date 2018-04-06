import { ElementRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { BaseComponent } from './base.component';

export abstract class BaseFormComponent extends BaseComponent implements ControlValueAccessor {
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

    constructor (widgetConfig: {widgetType, hostClass}, inj: any, $host: ElementRef, cdr: ChangeDetectorRef, propsReady?: Promise<void>) {
        super(widgetConfig, inj, $host, cdr, propsReady);
    }
}