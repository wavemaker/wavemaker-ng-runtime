import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { IWidgetConfig } from '../../../framework/types';
import { registerProps } from './input-text.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';

declare const _;

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-text',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-input[type="text"], wm-input:not([type]), wm-input[type="password"], wm-input[type="search"], wm-input[type="tel"], wm-input[type="url"]',
    templateUrl: './input-text.component.html',
    providers: [
        provideAsNgValueAccessor(InputTextComponent),
        provideAsWidgetRef(InputTextComponent)
    ]
})
export class InputTextComponent extends BaseInput {
    static initializeProps = registerProps();

    public required: boolean;
    public maxchars: number;
    public regexp: string;
    public displayformat: string;
    public disabled: boolean;
    public type: any;
    public name: string;
    public readonly: boolean;
    public tabindex: any;
    public placeholder: any;
    public shortcutkey: string;
    public autofocus: boolean;
    public autocomplete: any;
    public maskVal: any;

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    /* Define the property change handler. This function will be triggered when there is a change in the widget property */
    onPropertyChange(key, nv, ov) {
        /*Monitoring changes for styles or properties and accordingly handling respective changes.*/
        switch (key) {
            case 'displayformat':
                this.maskVal = [];
                _.forEach(this.displayformat, (dF) => {
                    // This condition is used to support all numbers from 0-9
                    if (dF === '9') {
                        this.maskVal.push(/\d/);
                    }
                    // This condition is used to support all capital and small alphabets
                    else if (dF === 'A') {
                        this.maskVal.push(/[A-Z, a-z]/);
                    }
                    // This condition is used to support all small alphabets
                    else if (dF === 'a') {
                        this.maskVal.push(/[a-z]/);
                    }
                    // This condition is used to support all characters except new line
                    else if (dF === '*') {
                        this.maskVal.push(/\w/);
                    } else {
                        this.maskVal.push(dF);
                    }
                });
                break;
            default:
                super.onPropertyChange(key, nv, ov);
        }
    }

    get mask() {
        if (this.displayformat) {
            return {mask: this.maskVal, showMask: true};
        } else {
            return {mask: false};
        }
    }
}
