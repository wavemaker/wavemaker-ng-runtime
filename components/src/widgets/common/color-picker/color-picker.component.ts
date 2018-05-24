import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { IWidgetConfig } from '../../framework/types';
import { styler } from '../../framework/styler';
import { registerProps } from './color-picker.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';


const DEFAULT_CLS = 'input-group app-colorpicker';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-colorpicker',
    hostClass: DEFAULT_CLS,
    displayType: 'inline-block'
};

registerProps();

@Component({
    selector: '[wmColorPicker]',
    templateUrl: './color-picker.component.html',
    providers: [
        provideAsNgValueAccessor(ColorPickerComponent),
        provideAsWidgetRef(ColorPickerComponent)
    ]
})
export class ColorPickerComponent extends BaseFormCustomComponent {

    @ViewChild(NgModel) ngModel: NgModel;
    @ViewChild('input', {read: ElementRef}) inputEl: ElementRef;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(this.inputEl.nativeElement, eventName, callback, locals);
        }
    }

    protected handleChange(newVal: boolean) {
        this.invokeOnChange(this.datavalue, {type: 'change'}, this.ngModel.valid);
    }
}