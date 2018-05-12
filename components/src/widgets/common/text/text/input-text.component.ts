import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { registerProps } from './input-text.props';
import { BaseInput } from '../base/base-input';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-input-text'};

@Component({
    selector: '[wmInput][type="text"], [wmInput]:not([type]), [wmInput][type="password"], [wmInput][type="search"], [wmInput][type="tel"], [wmInput][type="url"]',
    templateUrl: './input-text.component.html',
    providers: [
        provideAsNgValueAccessor(InputTextComponent),
        provideAsWidgetRef(InputTextComponent)
    ]
})
export class InputTextComponent extends BaseInput {

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }
}