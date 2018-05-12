import { Component, Injector, OnInit } from '@angular/core';
import { CONSTANTS_CURRENCY } from '@wm/core';

import { styler } from '../../framework/styler';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './currency.props';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';

const DEFAULT_CLS = 'input-group app-currency';
const WIDGET_CONFIG = {widgetType: 'wm-currency', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmCurrency]',
    templateUrl: './currency.component.html',
    providers: [
        provideAsNgValueAccessor(CurrencyComponent),
        provideAsWidgetRef(CurrencyComponent)
    ]
})
export class CurrencyComponent extends BaseFormCustomComponent implements OnInit {
    currency: string;
    oldVal;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement.querySelector('input'), this);
    }

    get currencysymbol() {
        return CONSTANTS_CURRENCY[this.currency || 'USD'].symbol;
    }

    // TODO: commanalize onchange event
    onChange($event) {
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
        this.invokeEventCallback('change', {$event, newVal: $event, oldVal: this.oldVal});
        this.oldVal = $event;
    }
}
