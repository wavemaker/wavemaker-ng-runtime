import { Component, forwardRef, Injector, OnInit } from '@angular/core';
import { CONSTANTS_CURRENCY } from '@wm/core';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { BaseFormComponent } from '../base/base-form.component';
import { getControlValueAccessor } from '../../../utils/widget-utils';
import { registerProps } from './currency.props';

const DEFAULT_CLS = 'input-group app-currency';
const WIDGET_CONFIG = {widgetType: 'wm-currency', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmCurrency]',
    templateUrl: './currency.component.html',
    providers: [getControlValueAccessor(CurrencyComponent), {
        provide: WidgetRef, useExisting: forwardRef(() => CurrencyComponent)
    }]
})
export class CurrencyComponent extends BaseFormComponent implements OnInit {
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
