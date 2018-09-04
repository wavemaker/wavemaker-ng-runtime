import { NgModel } from '@angular/forms';
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import {  DecimalPipe } from '@angular/common';

import { AbstractI18nService } from '@wm/core';
import { registerProps } from './number.props';
import { IWidgetConfig } from '../../framework/types';
import { provideAsNgValueAccessor, provideAsWidgetRef, provideAsNgValidators } from '../../../utils/widget-utils';
import { NumberLocale } from '../text/locale/number-locale';

registerProps();

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-number',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: '[wmNumber]',
    templateUrl: './number.component.html',
    providers: [
        provideAsNgValueAccessor(NumberComponent),
        provideAsNgValidators(NumberComponent),
        provideAsWidgetRef(NumberComponent)
    ]
})
export class NumberComponent extends NumberLocale {

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector, i18nService: AbstractI18nService, decimalPipe: DecimalPipe) {
        super(inj, WIDGET_CONFIG, i18nService, decimalPipe);
    }

}