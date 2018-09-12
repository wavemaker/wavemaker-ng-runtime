import { Injector } from '@angular/core';
import { Validator, AbstractControl } from '@angular/forms';
import { getLocaleNumberSymbol, NumberSymbol, DecimalPipe } from '@angular/common';

import { AbstractI18nService } from '@wm/core';
import { BaseInput } from '../base/base-input';
import { IWidgetConfig } from '../../../framework/types';

declare const _;

export abstract class NumberLocale extends BaseInput implements Validator {
    private DECIMAL: string;
    private GROUP: string;
    private selectedLocale: string;
    private proxyModel: number;
    private numberNotInRange: boolean;
    private isInvalidNumber: boolean;
    private displayValue: string;
    private numberfilter: string;
    private localefilter: string;
    private readonly: boolean;

    public placeholder: string;
    public minvalue: number;
    public maxvalue: number;
    public updateon: string;
    public step: number;

    constructor(
        inj: Injector,
        config: IWidgetConfig,
        i18nService: AbstractI18nService,
        private decimalPipe: DecimalPipe
    ) {
        super(inj, config);
        this.selectedLocale = i18nService.getSelectedLocale();
        this.DECIMAL = getLocaleNumberSymbol(this.localefilter || this.selectedLocale, NumberSymbol.Decimal);
        this.GROUP = getLocaleNumberSymbol(this.localefilter || this.selectedLocale, NumberSymbol.Group);
        this.numberfilter = '1.0-16';
        this.resetValidations();
    }

    // Setter for the datavalue.
    set datavalue (value: number) {
        // set text value to null if data value is empty.
        if (_.includes([null, undefined, ''], value)) {
            this.displayValue = this.proxyModel = null;
            this.resetValidations();
            this._onChange();
            return;
        }
        // get a valid number form the text.
        const model = this.parseNumber(value.toString());
        // if the number is valid update the model value.
        if (this.isValid(model)) {
            this.proxyModel = model;
            this.handleChange(model);
            // update the display value in the text box.
            this.updateDisplayText();
        } else {
            this._onChange();
        }
    }

    // returns the actual model value of the widget.
    get datavalue(): number {
        return this.proxyModel;
    }

    // resets all the flags related to the widget's validation.
    protected resetValidations() {
        this.isInvalidNumber = false;
        this.numberNotInRange = false;
    }

    /**
     * Adds validations for the number before updating the widget model. like validating min and max value for the widget.
     * @param {number} val number to be validated
     * @returns {number}
     */
    private isValid(val: number): boolean {
        if (_.isNaN(val)) {
            this.isInvalidNumber = true;
            return false;
        }
        if (val !== this.getValueInRange(val)) {
            this.numberNotInRange = true;
            return false;
        }
        this.resetValidations();
        return true;
    }

    /**
     * returns a valid number by validating the minimum and maximum values.
     * @param {number} value
     * @returns {number}
     */
    private getValueInRange(value: number): number {
        if (!_.isNaN(this.minvalue) && value < this.minvalue) {
            return this.minvalue;

        }
        if (!_.isNaN(this.maxvalue) && value > this.maxvalue) {
            return this.maxvalue;
        }
        return value;
    }

    /**
     * convert number to localized number using angular decimal pipe. eg 10,00,000 or 1,000,000
     * @param number
     * @returns {string}
     */
    private transformNumber(number): string {
        return this.decimalPipe.transform(number, this.numberfilter, this.localefilter);
    }

    /**
     * resets the cursor position in the text box.
     * @param {number} value cursor position index form left to right.
     */
    private resetCursorPosition(value: number) {
        const input = this.inputEl.nativeElement;
        // position of the cursor should be given form right to left.
        let position = input.value.length - value;
        position = position < 0 ? 0 : position;
        // set the cursor position in the text box.
        input.setSelectionRange(position, position);
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
        // If number have decimal point and not have a decimal value then return.
        if (parts[1] === '') {
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

    // updates the widgets text value.
    private updateDisplayText() {
        const input = this.inputEl.nativeElement;
        const position: number = input.selectionStart;
        const preValue: string = input.value;
        this.displayValue = input.value  = this.transformNumber(this.proxyModel);
        if (this.updateon === 'default') {
            this.resetCursorPosition(preValue.length - position);
        }
    }

    /**
     * handles the arrow press event. Increases or decreases the number. triggered fom the template
     * @param $event keyboard event.
     * @param key identifier to increase or decrease the number.
     */
    protected onArrowPress($event, key) {
        $event.preventDefault();
        if (this.readonly) {
            return;
        }
        const step = (this.step && this.step > 0) ? this.step : 1;
        let model = this.proxyModel || 0;
        if (step % 1 === 0) {
            model = Math.trunc(this.proxyModel);
        }
        this.datavalue = this.getValueInRange( model + (key === 'UP' ? step : -step));
    }

    /**
     * method is called fomr the from widget. to check whether the value entered is valid or not.
     * @returns {object}
     */
    public validate(c: AbstractControl) {
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
}