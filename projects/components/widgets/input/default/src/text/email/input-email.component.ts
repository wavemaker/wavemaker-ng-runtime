import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { IWidgetConfig, provideAsNgValueAccessor, provideAsWidgetRef, styler } from '@wm/components/base';

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
        provideAsNgValueAccessor(InputEmailComponent),
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

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}
