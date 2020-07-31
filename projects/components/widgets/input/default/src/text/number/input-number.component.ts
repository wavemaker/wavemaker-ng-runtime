import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import { IWidgetConfig, provideAs, provideAsWidgetRef } from '@wm/components/base';
import { registerProps } from './input-number.props';
import { BaseInput } from '../base/base-input';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-number',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-input[type="number"]',
    templateUrl: './input-number.component.html',
    providers: [
        provideAs(InputNumberComponent, NG_VALUE_ACCESSOR, true),
        provideAs(InputNumberComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(InputNumberComponent)
    ]
})
export class InputNumberComponent extends BaseInput {
    static initializeProps = registerProps();

    public required: boolean;
    public maxchars: number;
    public disabled: boolean;
    public name: string;
    public readonly: boolean;
    public minvalue: number;
    public maxvalue: number;
    public tabindex: any;
    public placeholder: any;
    public shortcutkey: string;
    public autofocus: boolean;
    public autocomplete: any;

    @ViewChild('input', {static: true}) inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    public step;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    onArrowPress($event) {
        if (this.step === 0) {
           $event.preventDefault();
        }
    }

    public validateInputEntry($event) {
        if ($event.key === 'e' &&  $event.target.value.indexOf($event.key) !== -1) {
            return false;
        }
    }
}
