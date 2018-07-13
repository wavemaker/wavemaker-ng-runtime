import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { CURRENCY_INFO } from '@wm/core';

import { IWidgetConfig } from '../../framework/types';
import { styler } from '../../framework/styler';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './currency.props';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';

const DEFAULT_CLS = 'input-group app-currency';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-currency',
    hostClass: DEFAULT_CLS
};

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
    currencySymbol: string;

    @ViewChild(NgModel) ngModel: NgModel;
    @ViewChild('input', {read: ElementRef}) inputEl: ElementRef;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement.querySelector('input'), this);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'tabindex') {
            return;
        }

        if (key === 'currency') {
            this.currencySymbol = CURRENCY_INFO[this.currency || 'USD'].symbol;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(this.inputEl.nativeElement, eventName, callback, locals);
        }
    }

    protected handleChange(newVal: boolean) {
        this.invokeOnChange(this.datavalue, {type: 'change'}, this.ngModel.valid);
    }
}
