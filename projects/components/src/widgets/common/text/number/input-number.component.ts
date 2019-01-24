import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { IWidgetConfig } from '../../../framework/types';
import { registerProps } from './input-number.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';

registerProps();

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-number',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-input[type="number"]',
    templateUrl: './input-number.component.html',
    providers: [
        provideAsNgValueAccessor(InputNumberComponent),
        provideAsWidgetRef(InputNumberComponent)
    ]
})
export class InputNumberComponent extends BaseInput {

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

    @ViewChild('input') inputEl: ElementRef;
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
