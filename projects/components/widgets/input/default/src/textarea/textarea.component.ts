import {Component, ElementRef, Injector, Optional, ViewChild} from '@angular/core';
import { NgModel, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import { provideAs, provideAsWidgetRef } from '@wm/components/base';

import { registerProps } from './textarea.props';
import { BaseInput } from '../text/base/base-input';
const WIDGET_CONFIG = {
    widgetType: 'wm-textarea',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-textarea',
    templateUrl: './textarea.component.html',
    providers: [
        provideAs(TextareaComponent, NG_VALUE_ACCESSOR, true),
        provideAs(TextareaComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(TextareaComponent)
    ]
})
export class TextareaComponent extends BaseInput {
    static initializeProps = registerProps();
    public required: boolean;
    public maxchars: number;
    public disabled: boolean;
    public name: string;
    public readonly: boolean;
    public tabindex: any;
    public placeholder: any;
    public shortcutkey: string;
    public autofocus: boolean;
    public hint: string;
    public limitdisplaytext: string;
    public charlength: number = 0;

    @ViewChild('textarea', {static: true}) inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    public onInputChange() {
        this.charlength = this.inputEl.nativeElement.value.length;
    }
}
