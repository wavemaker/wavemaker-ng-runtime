import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import { FormsModule } from '@angular/forms';
import {Component, Inject, Injector, Optional, ViewChild} from '@angular/core';
import {NG_VALUE_ACCESSOR, NgModel} from '@angular/forms';

import {IWidgetConfig, provideAs, provideAsWidgetRef, styler} from '@wm/components/base';
import {BaseFormCustomComponent} from '@wm/components/input';

import {registerProps} from './slider.props';


const DEFAULT_CLS = 'app-slider slider';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-slider',
    hostClass: DEFAULT_CLS
};

@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule, FormsModule],
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
    public hint: string;
    public arialabel: string;

    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
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
