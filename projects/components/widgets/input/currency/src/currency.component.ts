import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NgModel, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import {  DecimalPipe } from '@angular/common';

import { CURRENCY_INFO, AbstractI18nService } from '@wm/core';
import { IWidgetConfig, provideAs, provideAsWidgetRef } from '@wm/components/base';
import { NumberLocale } from '@wm/components/input';

import { registerProps } from './currency.props';

const DEFAULT_CLS = 'input-group app-currency';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-currency',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmCurrency]',
    templateUrl: './currency.component.html',
    providers: [
        provideAs(CurrencyComponent, NG_VALUE_ACCESSOR, true),
        provideAs(CurrencyComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(CurrencyComponent)
    ]
})
export class CurrencyComponent extends NumberLocale {
    static initializeProps = registerProps();

    currency: string;
    currencySymbol: string;
    public required: boolean;
    public regexp: any;
    public disabled: boolean;
    public autofocus: boolean;
    public name: string;
    public tabindex: any;
    public shortcutkey: string;

    @ViewChild(NgModel, {static: true}) ngModel: NgModel;
    @ViewChild('input', { static: true, read: ElementRef }) inputEl: ElementRef;

    constructor(inj: Injector, i18nService: AbstractI18nService, decimalPipe: DecimalPipe) {
        super(inj, WIDGET_CONFIG, i18nService, decimalPipe);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'currency') {
            this.currencySymbol = CURRENCY_INFO[this.currency || 'USD'].symbol;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
