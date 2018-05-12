import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { registerProps } from './input-number.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-input-number'};

@Component({
    selector: '[wmInput][type="number"]',
    templateUrl: './input-number.component.html',
    providers: [
        provideAsNgValueAccessor(InputNumberComponent),
        provideAsWidgetRef(InputNumberComponent)
    ]
})
export class InputNumberComponent extends BaseInput {

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}