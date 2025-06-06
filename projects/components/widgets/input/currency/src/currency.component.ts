import { WmComponentsModule } from "@wm/components/base";
import { FormsModule } from '@angular/forms';
import {Component, ElementRef, Inject, Injector, Optional, ViewChild} from '@angular/core';
import {NG_VALIDATORS, NG_VALUE_ACCESSOR, NgModel} from '@angular/forms';

import {AbstractI18nService, AppDefaults, CURRENCY_INFO} from '@wm/core';
import {IWidgetConfig, provideAs, provideAsWidgetRef, TrailingZeroDecimalPipe} from '@wm/components/base';
import {NumberLocale} from '@wm/components/input';

import {registerProps} from './currency.props';

const DEFAULT_CLS = 'input-group app-currency';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-currency',
    hostClass: DEFAULT_CLS
};

@Component({
  standalone: true,
  imports: [WmComponentsModule, FormsModule],
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

    currencyCode: string;
    currencySymbol: string;
    public required: boolean;
    public regexp: any;
    public disabled: boolean;
    public autofocus: boolean;
    public name: string;
    public tabindex: any;
    public shortcutkey: string;
    public hint: string;
    public arialabel: string;

    @ViewChild(NgModel, {static: true}) ngModel: NgModel;
    @ViewChild('input', { static: true, read: ElementRef }) inputEl: ElementRef;

    constructor(inj: Injector,  private appDefaults: AppDefaults, i18nService: AbstractI18nService, trailingZeroDecimalPipe: TrailingZeroDecimalPipe, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, i18nService, trailingZeroDecimalPipe, explicitContext);
        this.currencyCode = this.appDefaults.currencyCode || 'USD';
        this.currencySymbol = CURRENCY_INFO[this.appDefaults.currencyCode || "USD"].symbol;
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'currency') {
            this.currencyCode = nv;
            this.currencySymbol = CURRENCY_INFO[this.currencyCode|| this.appDefaults.currencyCode].symbol;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
