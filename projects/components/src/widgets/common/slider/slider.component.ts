import { Component, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { IWidgetConfig } from '../../framework/types';
import { styler } from '../../framework/styler';
import { registerProps } from './slider.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';


const DEFAULT_CLS = 'app-slider slider';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-slider',
    hostClass: DEFAULT_CLS
};

registerProps();

@Component({
    selector: '[wmSlider]',
    templateUrl: './slider.component.html',
    providers: [
        provideAsNgValueAccessor(SliderComponent),
        provideAsWidgetRef(SliderComponent)
    ]
})
export class SliderComponent extends BaseFormCustomComponent {

    public minvalue: number;
    public maxvalue: number;
    public disabled: boolean;
    public step: number;
    public shortcutkey: string;
    public tabindex: any;
    public name: string;
    public readonly: boolean;

    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(node, eventName, callback, locals);
        }
    }

    public handleChange(newVal: boolean) {
        this.invokeOnChange(this.datavalue, {type: 'change'}, this.ngModel.valid);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'tabindex') {
            return;
        }

        super.onPropertyChange(key, nv, ov);
    }
}
