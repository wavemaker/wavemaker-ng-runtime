import { FormsModule } from '@angular/forms';
import { ColorPickerService, ColorPickerDirective } from 'ngx-color-picker';
import { Component, ElementRef, Inject, Injector, Optional, ViewChild } from '@angular/core';
import { CommonModule } from "@angular/common";
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, NgModel } from '@angular/forms';

import { addClass, removeClass } from '@wm/core';
import { AUTOCLOSE_TYPE, IWidgetConfig, provideAs, provideAsWidgetRef, styler } from '@wm/components/base';
import { BaseFormCustomComponent } from '@wm/components/input';
import { registerProps } from './color-picker.props';

const DEFAULT_CLS = 'input-group app-colorpicker';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-colorpicker',
    hostClass: DEFAULT_CLS,
    displayType: 'inline-block'
};

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, ColorPickerDirective],
    selector: '[wmColorPicker]',
    templateUrl: './color-picker.component.html',
    providers: [
        provideAs(ColorPickerComponent, NG_VALUE_ACCESSOR, true),
        provideAs(ColorPickerComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(ColorPickerComponent),
        ColorPickerService
    ]
})
export class ColorPickerComponent extends BaseFormCustomComponent {
    static initializeProps = registerProps();

    public required: boolean;
    public readonly: boolean;
    public disabled: boolean;
    public name: string;
    public placeholder: any;
    public tabindex: any;
    public shortcutkey: string;
    public outsideclick: boolean;
    public autoclose: string;
    public hint: string;
    public arialabel: string;

    @ViewChild(NgModel) ngModel: NgModel;
    @ViewChild('input', { static: true, read: ElementRef }) inputEl: ElementRef;
    @ViewChild(ColorPickerDirective) cpDirective: ColorPickerDirective;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this);
    }

    public colorPickerToggleChange(isOpen: boolean) {
        const colorPickerContainer = this.nativeElement.querySelector(`.color-picker`) as HTMLElement;
        if (colorPickerContainer) {
            (!isOpen) ? addClass(colorPickerContainer, 'hidden') : removeClass(colorPickerContainer, 'hidden');
        }
    }

    colorPickerOpen(value: string) {
        // Note: $ is not available in this context, need to use proper DOM manipulation
        const hexInputs = this.nativeElement.querySelectorAll('.hex-text input');
        hexInputs.forEach((input: HTMLInputElement) => {
            input.setAttribute('placeholder', 'Enter hex color code');
        });
        if (this.autoclose === AUTOCLOSE_TYPE.ALWAYS) {
            const colorPickerContainer = this.nativeElement.querySelector(`.color-picker`) as HTMLElement;
            if (colorPickerContainer) {
                colorPickerContainer.onclick = () => this.cpDirective.closeDialog();
            }
        }
    }

    open() {
        this.cpDirective.openDialog();
    }

    close() {
        this.cpDirective.closeDialog();
    }

    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(this.inputEl.nativeElement, eventName, callback, locals);
        }
    }

    public handleChange(newVal: boolean) {
        this.invokeOnChange(this.datavalue, { type: 'change' }, this.ngModel.valid);
    }

    protected onPropertyChange(key: string, nv: any, ov: any) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'required') {
            this._onChange(this.datavalue);
            return;
        }
        if (key === 'datavalue') {
            this._onChange(nv);
            return;
        }
        if (key === 'autoclose') {
            this.outsideclick = (nv === AUTOCLOSE_TYPE.OUTSIDECLICK || nv === AUTOCLOSE_TYPE.ALWAYS) ? true : false;
        }
        super.onPropertyChange(key, nv, ov);
    }
}