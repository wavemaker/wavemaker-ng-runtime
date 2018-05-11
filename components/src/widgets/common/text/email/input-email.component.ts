import { Component, ElementRef, forwardRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { registerProps } from './input-email.props';
import { BaseInput } from '../base/base-input';
import { WidgetRef } from '../../../framework/types';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-input-email'};

@Component({
    selector: '[wmInput][type="email"]',
    templateUrl: './input-email.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => InputEmailComponent)}
    ]
})
export class InputEmailComponent extends BaseInput {

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}