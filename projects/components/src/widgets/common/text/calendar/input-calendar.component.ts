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

    public required: boolean;
    public disabled: boolean;
    public type: string;
    public name: string;
    public readonly: string;
    public minvalue: any;
    public maxvalue: any;
    public step: number;
    public tabindex: any;
    public placeholder: any;
    public shortcutkey: string;
    public autofocus: boolean;
    public autocomplete: any;
    
    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}
