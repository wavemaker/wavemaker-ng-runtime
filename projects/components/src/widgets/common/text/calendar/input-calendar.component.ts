import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { IWidgetConfig } from '../../../framework/types';
import { registerProps } from './input-calendar.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';

registerProps();

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-calendar',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-input[type="date"], wm-input[type="datetime-local"], wm-input[type="month"], wm-input[type="time"], wm-input[type="week"]',
    templateUrl: './input-calendar.component.html',
    providers: [
        provideAsNgValueAccessor(InputCalendarComponent),
        provideAsWidgetRef(InputCalendarComponent)
    ]
})
export class InputCalendarComponent extends BaseInput {

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}
