import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import { IWidgetConfig, provideAs, provideAsWidgetRef, styler } from '@wm/components/base';

import { registerProps } from './input-email.props';
import { BaseInput } from '../base/base-input';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-email',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-input[type="email"]',
    templateUrl: './input-email.component.html',
    providers: [
        provideAs(InputEmailComponent, NG_VALUE_ACCESSOR, true),
        provideAs(InputEmailComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(InputEmailComponent)
    ]
})
export class InputEmailComponent extends BaseInput {
    static initializeProps = registerProps();

    public required: boolean;
    public maxchars: number;
    public disabled: boolean;
    public name: string;
    public readonly: boolean;
    public tabindex: any;
    public shortcutkey: string;
    public autofocus: boolean;
    public autocomplete: any;
    public regexp: string;
    public placeholder: any;

    @ViewChild('input', /* TODO: add static flag */ {static: false}) inputEl: ElementRef;
    @ViewChild(NgModel, /* TODO: add static flag */ {static: false}) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}
