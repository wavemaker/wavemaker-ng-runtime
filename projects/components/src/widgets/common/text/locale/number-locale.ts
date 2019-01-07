import { Injector } from '@angular/core';
import { AbstractControl, Validator } from '@angular/forms';
import { DecimalPipe, getLocaleNumberSymbol, NumberSymbol } from '@angular/common';

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
            const input = this.inputEl.nativeElement;
            this.displayValue = input.value = this.proxyModel = null;
            this.resetValidations();
            this._onChange();
            return;
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
        if (_.isNaN(val) || !_.isFinite(val)) {
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
     * returns the number of decimal places a number have.
     * @param value: number
     * @returns {number}
     */
    private countDecimals (value) {
        if ((value % 1) !== 0) {
            return value.toString().split('.')[1].length;
        }
        return 0;
    }

    /**
     * handles the arrow press event. Increases or decreases the number. triggered fom the template
     * @param $event keyboard event.
     * @param key identifier to increase or decrease the number.
     */
    protected onArrowPress($event, key) {
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
                proxyModel = value = this.getValueInRange( (this.minvalue || 0));
                this.resetValidations();
            } else {
                value = this.getValueInRange( proxyModel + (key === 'UP' ? this.step : -this.step));
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

    protected validateInputEntry($event) {

        // allow actions if control key is pressed or if backspace is pressed. (for Mozilla).
        if ($event.ctrlKey || _.includes(['Backspace', 'ArrowRight', 'ArrowLeft', 'Tab'], $event.key)) {
            return;
        }

        const validity = new RegExp(`^[\\d\\s,.e+${this.GROUP}${this.DECIMAL}]$`, 'i');
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
        if (_.includes(inputValue, '+') &&  $event.key === '+') {
            return false;
        }
    }

    onEnter($event) {
        this.datavalue = $event.target.value;
    }
}
