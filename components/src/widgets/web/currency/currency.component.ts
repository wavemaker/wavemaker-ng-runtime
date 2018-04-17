import { Component, forwardRef, Injector, OnInit } from '@angular/core';
import { CONSTANTS_CURRENCY } from '@wm/utils';

import { styler } from '../../framework/styler';
import { IStylableComponent } from '../../framework/types';
import { BaseFormComponent } from '../base/base-form.component';
import { getControlValueAccessor, invokeEventHandler } from '../../utils/widget-utils';
import { registerProps } from './currency.props';

const DEFAULT_CLS = 'input-group app-currency';
const WIDGET_CONFIG = {widgetType: 'wm-currency', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmCurrency]',
    templateUrl: './currency.component.html',
    providers: [getControlValueAccessor(CurrencyComponent), {
        provide: '@Widget', useExisting: forwardRef(() => CurrencyComponent)
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
        styler(this.nativeElement.querySelector('input'), this as IStylableComponent);
    }

    get currencysymbol() {
        return CONSTANTS_CURRENCY[this.currency || 'USD'].symbol;
    }

    onChange($event) {
        invokeEventHandler(this, 'change', {$event, newVal: $event, oldVal: this.oldVal});
        this.oldVal = $event;
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
    }
}
