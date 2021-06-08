import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import { IWidgetConfig, provideAs, provideAsWidgetRef } from '@wm/components/base';
import { registerProps } from './input-number.props';
import { BaseInput } from '../base/base-input';

declare const _;

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
    public type: string;
    public inputmode: string;
    public trailingzero: boolean;
    public step;

    @ViewChild('input', {static: true}) inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;


    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'datavalue' && !ov) {
            this.onInputChange(nv);
        } else if (key === 'step' && this.datavalue) {
            this.onInputChange(this.datavalue);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    onArrowPress($event) {
        if (this.step === 0) {
           $event.preventDefault();
        }
    }

    public validateInputEntry($event) {
        const inputValue = $event.target.value;

        if ($event.key === 'e' &&  $event.target.value.indexOf($event.key) !== -1) {
            return false;
        }
        // validates entering of decimal values only when user provides decimal limit(i.e step contains decimal values).
         if (this.inputmode !== 'financial' && this.step && inputValue && this.countDecimals(this.step) && (this.countDecimals(inputValue) >= this.countDecimals(this.step))) {
            return false;
        }
    }

    /**
     * returns the number of decimal places a number have.
     * @param value: number
     * @returns {number}
     */
    private countDecimals(value) {
        if ((value % 1) !== 0) {
            const decimalValue = value.toString().split('.')[1];
            return decimalValue && decimalValue.length;
        }
        return 0;
    }

    /**
     * @param value contains the value entered in the input box
     * This function modifies the user input value, into financial mode. 
     * Number starts from highest precesion decimal, on typing number shifts to the left
     */
    public onInputChange(value: any) {
        if (!this.step) {
            return;
        }
        const stepLen = this.step.toString().split('.');
        if (stepLen.length === 1 || this.inputmode !== 'financial') {
            return;
        }

        const stepVal = stepLen[1].length;
  
        const valInWholeNum = parseInt(value.toString().replace(/\D/g,''));
        const financialVal = valInWholeNum *  this.step;


        if (!_.isNaN(financialVal)) {
            this.datavalue = financialVal.toFixed(stepVal);
        } else {
            this.datavalue = undefined;
        }
    }
}
