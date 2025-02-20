import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import { FormsModule } from '@angular/forms';
import {Component, ElementRef, Inject, Injector, Optional, ViewChild} from '@angular/core';
import {NG_VALIDATORS, NG_VALUE_ACCESSOR, NgModel} from '@angular/forms';

import {IWidgetConfig, provideAs, provideAsWidgetRef} from '@wm/components/base';

import {registerProps} from './input-color.props';
import {BaseInput} from '../base/base-input';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-color',
    hostClass: 'app-input-wrapper'
};

@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule, FormsModule],
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
    public conditionalclass: any;
    public conditionalstyle: any;
    public tabindex: any;
    public shortcutkey: string;
    public autofocus: boolean;
    public disabled: boolean;
    public placeholder: any;
    public type: string;
    public hint: string;
    public arialabel: string;

    @ViewChild('input', {static: true}) inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
    }
}
