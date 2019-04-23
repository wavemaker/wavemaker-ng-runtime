import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { addClass, removeClass } from '@wm/core';

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

@Component({
    selector: '[wmColorPicker]',
    templateUrl: './color-picker.component.html',
    providers: [
        provideAsNgValueAccessor(ColorPickerComponent),
        provideAsWidgetRef(ColorPickerComponent)
    ],
    host: {
        '(document:click)': 'handleClickAndEnterEvent($event)',
      },
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
    private display_flag : Boolean = true;

    @ViewChild(NgModel) ngModel: NgModel;
    @ViewChild('input', {read: ElementRef}) inputEl: ElementRef;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    public colorPickerToggleChange(isOpen: any) {
        console.log("Event : ",isOpen);
        const colorPickerContainer = this.nativeElement.querySelector(`.color-picker`) as HTMLElement;
        (!isOpen) ? addClass(colorPickerContainer, 'hidden') : removeClass(colorPickerContainer, 'hidden');
    }

    //handles click and enter events and toggles display_flag 
    private handleClickAndEnterEvent($event){
        //outsideclick event when color picker not opened
        if($event && $event.target && !$event.target.id && this.display_flag){
            return; //just return don't do anything
        }
        const colorPickerContainer = this.nativeElement.querySelector(`.color-picker`) as HTMLElement;
        (!this.display_flag) ? addClass(colorPickerContainer, 'hidden') : removeClass(colorPickerContainer, 'hidden');
        //handle the enter event and add cpVisible to override the style
        if($event && $event.keyCode ==13 && this.display_flag){
            addClass(colorPickerContainer,'cpVisible')
        }
        if(!this.display_flag){
            removeClass(colorPickerContainer,'cpVisible')
        }
        (this.display_flag) ? this.display_flag = false : this.display_flag = true;
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(this.inputEl.nativeElement, eventName, callback, locals);
        }
    }

    public handleChange(newVal: boolean) {
        this.invokeOnChange(this.datavalue, {type: 'change'}, this.ngModel.valid);
    }

    protected onPropertyChange(key: string, nv: any, ov: any) {
        if (key === 'tabindex') {
            return;
        }
        super.onPropertyChange(key, nv, ov);
    }
}
