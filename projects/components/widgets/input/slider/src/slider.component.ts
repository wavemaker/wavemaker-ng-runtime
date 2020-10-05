import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel, NG_VALUE_ACCESSOR } from '@angular/forms';

import { IWidgetConfig, provideAs, provideAsWidgetRef, styler } from '@wm/components/base';
import { BaseFormCustomComponent } from '@wm/components/input';
import { addClass } from '@wm/core';

import { registerProps } from './slider.props';


const DEFAULT_CLS = 'app-slider slider';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-slider',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmSlider]',
    templateUrl: './slider.component.html',
    providers: [
        provideAs(SliderComponent, NG_VALUE_ACCESSOR, true),
        provideAsWidgetRef(SliderComponent)
    ]
})
export class SliderComponent extends BaseFormCustomComponent {
    static initializeProps = registerProps();

    public minvalue: number;
    public maxvalue: number;
    public disabled: boolean;
    public step: number;
    public shortcutkey: string;
    public tabindex: any;
    public name: string;
    public readonly: boolean;
    @ViewChild('slider', {static: true}) sliderEle: ElementRef;

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

    ngAfterViewInit() {
        super.ngAfterViewInit();
        addClass(this.sliderEle.nativeElement, 'full-height');
    }
}
