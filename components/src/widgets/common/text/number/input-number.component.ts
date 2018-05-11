import { Component, ElementRef, forwardRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { registerProps } from './input-number.props';
import { BaseInput } from '../base/base-input';
import { WidgetRef } from '../../../framework/types';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-input-number'};

@Component({
    selector: '[wmInput][type="number"]',
    templateUrl: './input-number.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => InputNumberComponent)}
    ]
})
export class InputNumberComponent extends BaseInput {

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}