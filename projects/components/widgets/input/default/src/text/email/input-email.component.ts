import {Component, ElementRef, Inject, Injector, Optional, ViewChild} from '@angular/core';
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
    public conditionalclass: any;
    public conditionalstyle: any;
    public tabindex: any;
    public shortcutkey: string;
    public autofocus: boolean;
    public autocomplete: any;
    public regexp: string;
    public placeholder: any;
    public type: string;
    public hint: string;

    @ViewChild('input', {static: true}) inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
    }
}
