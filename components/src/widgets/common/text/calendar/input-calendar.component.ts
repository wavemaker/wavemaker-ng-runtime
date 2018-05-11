import { AfterViewInit, Component, ElementRef, forwardRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { registerProps } from './input-calendar.props';
import { BaseInput } from '../base/base-input';
import { WidgetRef } from '../../../framework/types';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-input-calendar'};

@Component({
    selector: '[wmInput][type="date"], [wmInput][type="datetime-local"], [wmInput][type="month"], [wmInput][type="time"], [wmInput][type="week"]',
    templateUrl: './input-calendar.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => InputCalendarComponent)}
    ]
})
export class InputCalendarComponent extends BaseInput implements AfterViewInit {

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}