import { Injector } from '@angular/core';
import { AbstractControl, Validator } from '@angular/forms';
import { getLocaleNumberSymbol, NumberSymbol } from '@angular/common';

import { AbstractI18nService } from '@wm/core';
import { IWidgetConfig, TrailingZeroDecimalPipe } from '@wm/components/base';

import { BaseInput } from '../base/base-input';

declare const _;

export abstract class NumberLocale extends BaseInput implements Validator {
    private DECIMAL: string;
    private GROUP: string;
    private selectedLocale: string;
    private proxyModel: number;
    private numberNotInRange: boolean;
    private isInvalidNumber: boolean;
    private isDefaultQuery: boolean = true;
    private decimalValue: string = '';
    public displayValue: string;
    private numberfilter: string;
    private localefilter: string;
    public readonly: boolean;

    public placeholder: string;
    public minvalue: number;
    public maxvalue: number;
    public updateon: string;
    public step: number;
    public trailingzero: boolean;
    private validateType: string;

    constructor(
        inj: Injector,
        config: IWidgetConfig,
        i18nService: AbstractI18nService,
        private trailingZeroDecimalPipe: TrailingZeroDecimalPipe
    ) {
        super(inj, config);
        this.selectedLocale = i18nService.getSelectedLocale();
        this.DECIMAL = getLocaleNumberSymbol(this.localefilter || this.selectedLocale, NumberSymbol.Decimal);
        this.GROUP = getLocaleNumberSymbol(this.localefilter || this.selectedLocale, NumberSymbol.Group);
        this.numberfilter = '1.0-16';
        this.resetValidations();
    }

    // Setter for the datavalue.
    set datavalue(value: number) {
        // set text value to null if data value is empty.
        if (_.includes([null, undefined, ''], value)) {
            const input = this.inputEl.nativeElement;
            this.displayValue = input.value = this.proxyModel = null;
            this.resetValidations();
            this._onChange();
            return;
        }
        // if the widget has default value and if we change the locale, the value should be in selected locale format.
        if (this.isDefaultQuery) {
            const isLocalizedNumber = _.isString(value) && _.includes(value, this.DECIMAL);
            const parts = isLocalizedNumber ?  (value as any).split(this.DECIMAL) : _.isString(value) && (value as any).split('.');
            this.decimalValue = parts[1] || '';
            (value as any) = isLocalizedNumber ? value : this.transformNumber(value);
        }

        // get a valid number form the text.
        const model = this.parseNumber(value.toString());
        // if the number is valid or if number is not in range update the model value.
        if (this.isValid(model)) {
            this.proxyModel = model;
            // update the display value in the text box.
            this.updateDisplayText();
            this.handleChange(model);
        } else {
            this.displayValue = value.toString();
            this.proxyModel = null;
            this.handleChange(null);
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
        // id number is infinite then consider it as invalid value
        if (_.isNaN(val) || !_.isFinite(val) || (!Number.isInteger(this.step) &&
            this.countDecimals(val) > this.countDecimals(this.step))) {
            this.isInvalidNumber = true;
            return false;
        }
        if (val !== this.getValueInRange(val)) {
            this.numberNotInRange = true;
            return true;
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
            this.validateType = 'minvalue';
            return this.minvalue;

        }
        if (!_.isNaN(this.maxvalue) && value > this.maxvalue) {
            this.validateType = 'maxvalue';
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
        const normalizedNum = number.toString().replace(this.GROUP, '');
        return this.trailingZeroDecimalPipe.transform(parseInt(normalizedNum), this.selectedLocale, this.numberfilter, this.localefilter, this.trailingzero, this.decimalValue);
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
        if (Number.isNaN(number) || Number.isNaN(decimal)) {
            return NaN;
        }
        // if the number is negative then calculate the number as number - decimal
        // Ex: number = -123 and decimal = 0.45 then number - decimal = -123-045 = -123.45
        return number >= 0 ? number + decimal : number - decimal;
    }

    // updates the widgets text value.
    private updateDisplayText() {
        const input = this.inputEl.nativeElement;
        const position: number = input.selectionStart;
        const preValue: string = input.value;
        if (!this.isDefaultQuery) {
            const parts = preValue.split(this.DECIMAL);
            this.decimalValue = parts[1] || '';
        }
        this.displayValue = input.value = this.transformNumber(this.proxyModel);
        // in safari browser, setSelectionRange will focus the input by default, which may invoke the focus event on widget.
        // Hence preventing the setSelectionRange when default value is set i.e. widget is not focused.
        if (this.updateon === 'default' && !this.isDefaultQuery) {
            this.resetCursorPosition(preValue.length - position);
        }
    }

    /**
     * returns the number of decimal places a number have.
     * @param value: number
     * @returns {number}
     */
    private countDecimals(value) {
        if ((value % 1) !== 0) {
            const decimalValue = value.toString().split('.')[1];
            return decimalValue && decimalValue.length;
        }
        return 0;
    }

    /**
     * handles the arrow press event. Increases or decreases the number. triggered fom the template
     * @param $event keyboard event.
     * @param key identifier to increase or decrease the number.
     */
    public onArrowPress($event, key) {
        $event.preventDefault();
        if (this.readonly || this.step === 0) {
            return;
        }
        let proxyModel = this.proxyModel;
        let value;

        // if the number is not in range and when arrow buttons are pressed need to get appropriate number value.
        if (this.numberNotInRange) {
            const inputValue = this.parseNumber(this.inputEl.nativeElement.value);
            // take the textbox value as current model if the value is valid.
            if (!_.isNaN(inputValue)) {
                value = this.getValueInRange(inputValue);
                proxyModel = inputValue;
                this.resetValidations();
            }
        } else {
            if (_.isUndefined(proxyModel) || _.isNull(proxyModel)) {
                proxyModel = value = this.getValueInRange((this.minvalue || 0));
                this.resetValidations();
            } else {
                value = this.getValueInRange(proxyModel + (key === 'UP' ? this.step : -this.step));
            }
        }
        if ((key === 'UP' && proxyModel <= value) || (key === 'DOWN' && proxyModel >= value)) {
            const decimalRoundValue = Math.max(this.countDecimals(proxyModel), this.countDecimals(this.step));

            // update the modelProxy.
            this.proxyModel = _.round(value, decimalRoundValue);
            this.updateDisplayText();
            this.handleChange(this.proxyModel);
        }
    }

    /**
     * method is called from the from widget. to check whether the value entered is valid or not.
     * @returns {object}
     */
    public validate(c: AbstractControl) {
        if (this.isInvalidNumber) {
            this.validateType = '';
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
        this.validateType = '';
        /* WMS-18269 | Extending the existing validation for 'required' */
        if (this['show'] && this['required']) {
            return (!!c.value || c.value === 0) ? null : { required: true };
        }
        return null;
    }

    public validateInputEntry($event) {

        this.isDefaultQuery = false;

        // allow actions if control key is pressed or if backspace is pressed. (for Mozilla).
        if ($event.ctrlKey || _.includes(['Backspace', 'ArrowRight', 'ArrowLeft', 'Tab', 'Enter'], $event.key)) {
            return;
        }

        const validity = new RegExp(`^[\\d\\s-,.e+${this.GROUP}${this.DECIMAL}]$`, 'i');
        const inputValue = $event.target.value;
        // validates if user entered an invalid character.
        if (!validity.test($event.key)) {
            return false;
        }
        // a decimal value can be entered only once in the input.
        if (_.includes(inputValue, this.DECIMAL) && $event.key === this.DECIMAL) {
            return false;
        }
        // 'e' can be entered only once in the input.
        if (_.intersection(_.toArray(inputValue), ['e', 'E']).length && _.includes('eE', $event.key)) {
            return false;
        }
        if ((_.includes(inputValue, '+') || _.includes(inputValue, '-')) && ($event.key === '+' || $event.key === '-')) {
            return false;
        }
    }

    onEnter($event) {
        this.datavalue = $event.target.value;
    }

    onPropertyChange(key, nv, ov?) {
        if (key === 'minvalue' || key === 'maxvalue') {
            this.isValid(nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
