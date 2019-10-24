import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { registerProps } from './textarea.props';
import { BaseInput } from '../text/base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';

const WIDGET_CONFIG = {
    widgetType: 'wm-textarea',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-textarea',
    templateUrl: './textarea.component.html',
    providers: [
        provideAsNgValueAccessor(TextareaComponent),
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
    @ViewChild('textarea') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}
