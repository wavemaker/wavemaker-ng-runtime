import { Component, Injector, ElementRef, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { CONSTANTS_CURRENCY } from './currency.constants';
import { registerProps } from './currency.props';
import { styler } from '../../utils/styler';

const DEFAULT_CLS = 'input-group app-currency';
const WIDGET_CONFIG = {widgetType: 'wm-currency', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmCurrency]',
    templateUrl: './currency.component.html'
})
export class CurrencyComponent extends BaseComponent {
    currency: string;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    _ngOnInit() {
        styler(this.$element.querySelector('input'), this);
    }

    get currencysymbol() {
        return CONSTANTS_CURRENCY[this.currency || 'USD'].symbol;
    }
}
