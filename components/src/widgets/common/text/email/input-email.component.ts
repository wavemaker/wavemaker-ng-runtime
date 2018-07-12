import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { IWidgetConfig } from '../../../framework/types';
import { registerProps } from './input-email.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';

registerProps();

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-email',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-input[type="email"]',
    templateUrl: './input-email.component.html',
    providers: [
        provideAsNgValueAccessor(InputEmailComponent),
        provideAsWidgetRef(InputEmailComponent)
    ]
})
export class InputEmailComponent extends BaseInput {

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}