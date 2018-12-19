import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { registerProps } from './textarea.props';
import { BaseInput } from '../text/base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-textarea', hostClass: 'app-input-wrapper'};

@Component({
    selector: 'wm-textarea',
    templateUrl: './textarea.component.html',
    providers: [
        provideAsNgValueAccessor(TextareaComponent),
        provideAsWidgetRef(TextareaComponent)
    ]
})
export class TextareaComponent extends BaseInput {

    @ViewChild('textarea') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}
