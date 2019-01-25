import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { IWidgetConfig } from '../../../framework/types';
import { registerProps } from './input-text.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-text',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-input[type="text"], wm-input:not([type]), wm-input[type="password"], wm-input[type="search"], wm-input[type="tel"], wm-input[type="url"]',
    templateUrl: './input-text.component.html',
    providers: [
        provideAsNgValueAccessor(InputTextComponent),
        provideAsWidgetRef(InputTextComponent)
    ]
})
export class InputTextComponent extends BaseInput {
    static initializeProps = registerProps();

    public required: boolean;
    public maxchars: number;
    public regexp: string;
    public displayformat: string;
    public disabled: boolean;
    public type: any;
    public name: string;
    public readonly: boolean;
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
