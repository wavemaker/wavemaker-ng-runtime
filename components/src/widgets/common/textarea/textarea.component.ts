import { Component, ElementRef, forwardRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { WidgetRef } from '../../framework/types';
import { registerProps } from './textarea.props';
import { BaseInput } from '../text/base/base-input';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-textarea'};

@Component({
    selector: '[wmTextarea]',
    templateUrl: './textarea.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => TextareaComponent)}
    ]
})
export class TextareaComponent extends BaseInput {

    @ViewChild('textarea') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}