import {Component, ElementRef, Injector, Optional, ViewChild} from '@angular/core';
import { NgModel, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import { IWidgetConfig, provideAs, provideAsWidgetRef } from '@wm/components/base';

import { registerProps } from './input-color.props';
import { BaseInput } from '../base/base-input';
import {UserDefinedExecutionContext} from '@wm/core';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-color',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-input[type="color"]',
    templateUrl: './input-color.component.html',
    providers: [
        provideAs(InputColorComponent, NG_VALUE_ACCESSOR, true),
        provideAs(InputColorComponent, NG_VALIDATORS, true),
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
    public type: string;
    public hint: string;

    @ViewChild('input', {static: true}) inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);
    }
}
