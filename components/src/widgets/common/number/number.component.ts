import { NgModel } from '@angular/forms';
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { getLocaleNumberSymbol, NumberSymbol, DecimalPipe } from '@angular/common';

import { AbstractI18nService } from '@wm/core';
import { registerProps } from './number.props';
import { BaseInput } from '../text/base/base-input';
import { IWidgetConfig } from '../../framework/types';
import { provideAsNgValueAccessor, provideAsWidgetRef, provideAsNgValidators } from '../../../utils/widget-utils';

declare const _;

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
export class NumberComponent extends BaseInput {
    private DECIMAL: string;
    private GROUP: string;
    private selectedLocale: string;
    private proxyModel: number;
    private numberNotInRange: boolean;
    private isInvalidNumber: boolean;

    public numberFilter: string;
    public localeFilter: string;
    public placeholder: string;
    public minvalue: number;
    public maxvalue: number;

    @ViewChild('input') inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    // Setter for the datavalue.
    set datavalue (value: number) {
        // set text value to null if data value is empty.
        if (_.includes([null, undefined, ''], value)) {
            this.inputEl.nativeElement.value = this.proxyModel = null;
            return;
        }
        // get a valid number form the text.
        const model = this.parseNumber(value.toString());
        // if the number is valid update the model value.
        if (this.isValid(model)) {
            this.proxyModel = model;
            this.handleChange(model);
            // update the display value in the text box.
            this.updateInputText();
        }
    }

    // returns the actual model value of the widget.
    get datavalue(): number {
        return this.proxyModel;
    }

    constructor(inj: Injector, private decimalPipe: DecimalPipe, i18nService: AbstractI18nService) {
        super(inj, WIDGET_CONFIG);
        this.selectedLocale = i18nService.getSelectedLocale();
        this.DECIMAL = getLocaleNumberSymbol(this.localeFilter || this.selectedLocale, NumberSymbol.Decimal);
        this.GROUP = getLocaleNumberSymbol(this.localeFilter || this.selectedLocale, NumberSymbol.Group);
        this.numberFilter = '1.0-16';
        this.resetValidations();
    }

    private resetValidations() {
        this.isInvalidNumber = false;
        this.numberNotInRange = false;
    }

    /**
     * Adds validations for the number before updating the widget model. like validating min and max value for the widget.
     * @param {number} val number to be validated
     * @returns {number}
     */
    isValid(val: number): boolean {
        if (_.isNaN(val)) {
            this.isInvalidNumber = true;
            return false;
        }
        if (!_.isNaN(this.minvalue) && val < this.minvalue) {
            this.numberNotInRange = true;
            return false;
        }
        if (!_.isNaN(this.maxvalue) && val > this.maxvalue) {
            this.numberNotInRange = true;
            return false;
        }
        this.resetValidations();
        return true;
    }

    /**
     * Method parses the Localized number(string) to a valid number.
     * if the string dose not result to a valid number then returns NaN.
     * @param {string} val Localized number.
     * @returns {number}
     */
    private parseNumber(val: string): number {
        // splits string into two parts. decimal and number.
        const parts = val.split(this.DECIMAL);
        if (!parts.length) {
            return null;
        }
        if (parts.length > 2) {
            return NaN;
        }
        // replaces all group separators form the number.
        const number = Number(parts[0].split(this.GROUP).join(''));
        const decimal = Number(`0.${parts[1] || 0}`);
        if ( Number.isNaN(number) || Number.isNaN(decimal)) {
            return NaN;
        }
        return number + decimal;
    }

    public validate() {
        if (this.isInvalidNumber) {
            return {
                invalidNumber: {
                    valid: false
                },
            };
        }
        if (this.numberNotInRange) {
            return {
                numberNotInRange: {
                    valid: false
                },
            };
        }
        return null;
    }

    /**
     * convert number to localized number using angular decimal pipe. eg 10,00,000 or 1,000,000
     * @param number
     * @returns {string}
     */
    private transformNumber(number): string {
        return this.decimalPipe.transform(number, this.numberFilter, this.localeFilter);
    }

    /**
     * updates the widgets text value.
     */
    public updateInputText() {
        this.inputEl.nativeElement.value = this.transformNumber(this.proxyModel);
    }
}