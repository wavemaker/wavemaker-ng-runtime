import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel, NG_VALUE_ACCESSOR } from '@angular/forms';

import { IWidgetConfig, provideAs, provideAsWidgetRef } from '@wm/components/base';

import { registerProps } from './input-color.props';
import { BaseInput } from '../base/base-input';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-color',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-input[type="color"]',
    templateUrl: './input-color.component.html',
    providers: [
        provideAs(InputColorComponent, NG_VALUE_ACCESSOR, true),
        provideAsWidgetRef(InputColorComponent)
    ]
})
export class InputColorComponent extends BaseInput {
    static initializeProps = registerProps();

    public required: boolean;
    public maxchars: number;
    public name: string;
    public readonly: boolean;
    public tabindex: any;
    public shortcutkey: string;
    public autofocus: boolean;
    public disabled: boolean;
    public placeholder: any;
    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}
