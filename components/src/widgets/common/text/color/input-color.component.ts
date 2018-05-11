import { Component, ElementRef, forwardRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { registerProps } from './input-color.props';
import { BaseInput } from '../base/base-input';
import { WidgetRef } from '../../../framework/types';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-input-color'};

@Component({
    selector: '[wmInput][type="color"]',
    templateUrl: './input-color.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => InputColorComponent)}
    ]
})
export class InputColorComponent extends BaseInput {

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}