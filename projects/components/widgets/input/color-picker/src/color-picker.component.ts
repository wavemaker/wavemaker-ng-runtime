import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { ColorPickerDirective} from 'ngx-color-picker';

import { addClass, removeClass } from '@wm/core';
import { AUTOCLOSE_TYPE, IWidgetConfig, provideAs, provideAsWidgetRef, styler } from '@wm/components/base';
import { BaseFormCustomComponent } from '@wm/components/input';
import { registerProps } from './color-picker.props';
import * as _ from 'lodash';


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
        provideAs(ColorPickerComponent, NG_VALUE_ACCESSOR, true),
        provideAs(ColorPickerComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(ColorPickerComponent)
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
    public presetcolors: any;
    public presetcolorposition: any;


    @ViewChild(NgModel) ngModel: NgModel;
    @ViewChild('input', { static: true, read: ElementRef }) inputEl: ElementRef;
    @ViewChild(ColorPickerDirective) cpDirective: ColorPickerDirective;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    // To remove space occupied by colorpicker when it is closed
    public colorPickerToggleChange(isOpen: boolean) {
        const colorPickerContainer = this.nativeElement.querySelector(`.color-picker`) as HTMLElement;
        if (colorPickerContainer) {
            (!isOpen) ? addClass(colorPickerContainer, 'hidden') : removeClass(colorPickerContainer, 'hidden');
        }
    }

    colorPickerOpen(value: string) {
        // Whenever autoclose property is set to 'always', adding the onclick listener to the colorPicker container to close the picker.
        if (this.autoclose === AUTOCLOSE_TYPE.ALWAYS) {
            const colorPickerContainer = this.nativeElement.querySelector(`.color-picker`) as HTMLElement;
            colorPickerContainer.onclick = () => this.cpDirective.closeDialog();
        }
    }

    // This mehtod is used to show/open the colorpicker popup.
    open() {
        this.cpDirective.openDialog();
    }

    // This mehtod is used to hide/close the colorpicker popup.
    close() {
        this.cpDirective.closeDialog();
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
        if (key === 'required') {
            /* WMS-18269 | Update Angular about the required attr value change */
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
        if (key === 'presetcolors') {
            if (nv === "" ){
                nv = [];
                this.presetcolors = [];
            } else if (_.isString(nv) || _.isArray(nv)) {
                _.isString(nv) ? this.presetcolors = nv.split(',').slice(0,42): this.presetcolors = nv.slice(0,42);
                if (this.presetcolorposition === "right") {
                    $(function() {
                        let colorPickerClass = document.getElementsByClassName('app-colorpicker');
                        colorPickerClass[0].classList.add("extendright");
                    });
                }
            }
        }
        if (key === 'presetcolorposition' && typeof this.presetcolors !== 'undefined' && this.presetcolors.length > 0) {
            if (nv === 'bottom') {
                $(function() {
                    let colorPickerClass = document.getElementsByClassName('app-colorpicker');
                    if (colorPickerClass[0].classList.contains("extendright")) {
                        colorPickerClass[0].classList.remove("extendright");
                    }
                });
            } else if (nv === 'right') {
                $(function() {
                    let colorPickerClass = document.getElementsByClassName('app-colorpicker');
                    colorPickerClass[0].classList.add("extendright");
                });
            }
        }
        super.onPropertyChange(key, nv, ov);
    }
}
