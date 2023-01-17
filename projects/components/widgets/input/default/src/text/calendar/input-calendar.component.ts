import {Component, ElementRef, Injector, Optional, ViewChild} from '@angular/core';
import { NgModel, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import { IWidgetConfig, provideAs, provideAsWidgetRef, styler } from '@wm/components/base';
import { registerProps } from './input-calendar.props';
import { BaseInput } from '../base/base-input';
import {UserDefinedExecutionContext} from '@wm/core';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-calendar',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-input[type="date"], wm-input[type="datetime-local"], wm-input[type="month"], wm-input[type="time"], wm-input[type="week"]',
    templateUrl: './input-calendar.component.html',
    providers: [
        provideAs(InputCalendarComponent, NG_VALUE_ACCESSOR, true),
        provideAs(InputCalendarComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(InputCalendarComponent)
    ]
})
export class InputCalendarComponent extends BaseInput {
    static initializeProps = registerProps();

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
    public hint: string;

    @ViewChild('input',{static: true}) inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);
    }
}
