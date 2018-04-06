import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit } from '@angular/core';
import { registerProps } from './currency.props';
import { styler } from '../../utils/styler';
import { CONSTANTS_CURRENCY } from '@wm/utils';
import { getControlValueAccessor, invokeEventHandler } from '../../utils/widget-utils';
import { BaseFormComponent } from '../base/base-form.component';

const DEFAULT_CLS = 'input-group app-currency';
const WIDGET_CONFIG = {widgetType: 'wm-currency', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmCurrency]',
    templateUrl: './currency.component.html',
    providers: [getControlValueAccessor(CurrencyComponent)]
})
export class CurrencyComponent extends BaseFormComponent implements OnInit {
    currency: string;
    oldVal;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.$element.querySelector('input'), this);
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
