import { Inject, Injector } from '@angular/core';
import { AbstractControl, Validator } from '@angular/forms';
import { getLocaleNumberSymbol, NumberSymbol } from '@angular/common';

import { AbstractI18nService, isDefined } from '@wm/core';
import { IWidgetConfig, TrailingZeroDecimalPipe, INPUTMODE, WIDGET_CONFIG } from '@wm/components/base';
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
    public inputmode: string;
    private lastValIsDecimal: boolean;

    constructor(
        inj: Injector,
        @Inject(WIDGET_CONFIG) config: IWidgetConfig,
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
    // @ts-ignore
    set datavalue(value: number) {
        this.lastValIsDecimal = false;

        // set text value to null if data value is empty.
        if (_.includes([null, undefined, ''], value)) {
            const input = this.inputEl.nativeElement;
            const prevDataValue =  (this as any).prevDatavalue;
            this.displayValue = input.value = this.proxyModel = null;
            this.resetValidations();
            if (prevDataValue && !this.isDefaultQuery) {
                this.handleChange(value);
                this._onChange();
            }
            return;
        }
        // if the widget has default value and if we change the locale, the value should be in selected locale format.
        if (this.isDefaultQuery) {
            const isLocalizedNumber = _.isString(value) && _.includes(value, this.DECIMAL);
            const parts = isLocalizedNumber ?  (value as any).split(this.DECIMAL) : _.isString(value) && (value as any).split('.');
            this.decimalValue = parts[1] || '';
            (value as any) = isLocalizedNumber ? value : this.transformNumber(value);
        }

        const numberReg = /\d/;
        const strVal = value.toString();
        let model;
        // When the input value only contains seperator, do not convert the sepertaor into 0
        if (numberReg.test(strVal)) {
            model = this.parseNumber(strVal);
        } else {
            model = NaN;
        }

        // On keypress, if the user types a decimal and is still active on the input do not throw error. 
        if (_.isNaN(model) && strVal[strVal.length - 1] === this.DECIMAL && this.ngModelOptions.updateOn === 'change' && this.$element.find('input:focus').length) {
            this.lastValIsDecimal = true;
        }
        // get a valid number form the text.
        // if the number is valid or if number is not in range update the model value.
        if (!this.lastValIsDecimal && this.isValid(model)) {
            this.proxyModel = model;
            // update the display value in the text box.
            this.updateDisplayText();
            // Do not trigger onchange event for default value
            if (!this.isDefaultQuery) {
                this.handleChange(model);
            }
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
    private transformNumber(number, numberfilter?): string {
        const filterVal = numberfilter ? numberfilter : this.numberfilter;
        return this.trailingZeroDecimalPipe.transform(number, this.selectedLocale, filterVal, this.localefilter, this.trailingzero, this.decimalValue, !!numberfilter);
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
        const sum = parts.length > 1 ? parseFloat((number + decimal).toFixed(parts[1].length)) : number + decimal;
        // if the number is negative then calculate the number as number - decimal
        // Ex: number = -123 and decimal = 0.45 then number - decimal = -123-045 = -123.45
        // If entered number is -0.1 to -0.9 then the number is -0 and decimal is 0.1 to 0.9. Now calaculate the number as number-decimal
        // Ex: number = -0 and decimal = 0.1 then number-decimal = -0-0.1 = -0.1
        if (number === 0) {
            return Object.is(0, number) ? sum : number - decimal;
        }
        return number > 0 ? sum : number - decimal;
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
        const stepVal = this.stepLength();
        if (this.inputmode === INPUTMODE.FINANCIAL && stepVal) {
            this.displayValue = input.value = this.transformNumber(this.proxyModel, `1.${stepVal}-${stepVal}`);
            this.decimalValue = this.decimalValue.replace(/\D/g,'');
        } else {
            this.displayValue = input.value = this.transformNumber(this.proxyModel);
        }
        // in safari browser, setSelectionRange will focus the input by default, which may invoke the focus event on widget.
        // Hence preventing the setSelectionRange when default value is set i.e. widget is not focused.
        if (this.updateon === 'default' && !this.isDefaultQuery) {
            this.resetCursorPosition(preValue.length - position);
        }
    }

    // This function returns the step length set in the studio
    private stepLength() {
        const stepLen = this.step.toString().split('.');
        if (stepLen.length === 1 ) {
            return; 
        } else {
            return stepLen[1].length;
        }
    }

    // This function checks if the currency widget has input mode as natural and trailing zero is defined or not
    public isNaturalCurrency() {
        return this.inputmode === INPUTMODE.NATURAL && this.widgetType === 'wm-currency' && !!this.trailingzero;
    }

       /**
     * @param value contains the value entered in the input box
     * This function modifies the user input value, into financial mode. 
     * Number starts from highest precesion decimal, on typing number shifts to the left
     */
    public onInputChange(value: any) {
        const stepVal = this.stepLength();
        if (isDefined(value) && value !== '') {
            this.handleChange(value);
        } else {
            return;
        }

        if (!stepVal || this.inputmode !== INPUTMODE.FINANCIAL) {
            return;
        }

        let financialVal;

        /**
         * If the value is entered by the user, format the input 
         * If the value is provided as default value, skip formatting
         */
        if (this.isDefaultQuery) {
            financialVal = parseFloat(value);
        } else {
            const valInWholeNum = parseInt(value.toString().replace(/\D/g,''));
            financialVal = valInWholeNum *  this.step;
        }

        if (!_.isNaN(financialVal)) {
            // When update on key is set keypress, update the datavalue else update only the display value
            if (this.ngModelOptions.updateOn === 'change') {
                this.datavalue = parseFloat(financialVal.toFixed(stepVal));
                this.handleChange(this.datavalue);
            } else {
                this.displayValue = financialVal.toFixed(stepVal);
            }
        } else {
            this.datavalue = undefined;
            this.handleChange(null);
        }
    }

    // Input mode is financial and trailing zero is set to false, On focus set display val to fixed point notation and On blur strip trailing zeros
    // In currency, inputmode is natural and trailing zero and step are defined, on blur display val to fixed point notation and on focus strip the zeros
    public checkForTrailingZeros($event) {
        const stepVal = this.stepLength();
        const financialMode = !this.trailingzero && this.inputmode === INPUTMODE.FINANCIAL;

        // If the user's last input is a decimal and not active on input field, throw error
        if (this.lastValIsDecimal) {
            this.onModelChange(this.displayValue);
        }
        if (!financialMode && !this.isNaturalCurrency()) {
            return;
        }
        if (stepVal && this.datavalue) {
            let numberfilter;
            if ((financialMode && $event.type === 'focus') || (this.isNaturalCurrency() && $event.type === 'blur')) {
                numberfilter = `1.${stepVal}-${stepVal}`;
            } 
            this.displayValue = this.transformNumber(this.datavalue, numberfilter);
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
        const targetVal = $event.target.value.replace(/,/g, '');

        // proxyModel to be updated from $event.target.value if present to support arrow keys when input changes else pick up from this.proxymodel
        let proxyModel;
        if (targetVal && !_.isNaN(parseFloat(targetVal))) {
            proxyModel = parseFloat(targetVal);
        } else {
            proxyModel = this.proxyModel;
        }

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
        if ($event.ctrlKey || _.includes(['Backspace', 'ArrowRight', 'ArrowLeft', 'Tab', 'Enter', 'Delete'], $event.key)) {
            return;
        }

        const validity = new RegExp(`^[\\d\\s-,.e+${this.GROUP}${this.DECIMAL}]$`, 'i');
        const inputValue = $event.target.value;

        // when input mode is financial, do not restrict user on entering the value when step value limit is reached. 
        const skipStepValidation = this.inputmode === INPUTMODE.FINANCIAL;

        // Validates if user eneters more than 16 digits
        if (inputValue) {
            const parsedVal =  parseInt(inputValue.toString().replace(/\D/g,''));
            if (parsedVal.toString().length > 15) {
                return false;
            }
        }

        // validates entering of decimal values only when user provides decimal limit(i.e step contains decimal values).
        // Restrict user from entering only if the decimal limit is reached and the new digit is entered in decimal place
        if (!skipStepValidation && inputValue && this.countDecimals(this.step) && (this.countDecimals(inputValue) >= this.countDecimals(this.step)) && $event.target.selectionStart >= inputValue.length - 1) {
            return false;
        }
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
        // Do not allow user to enter only space without any input value
        if (!inputValue && $event.code === 'Space') {
            return false;
        } 
    }

    onBackspace($event) {
        this.isDefaultQuery = false;
    }

    onEnter($event) {
        this.datavalue = $event.target.value;
    }

    onModelChange($event) {
        if (this.inputmode === INPUTMODE.NATURAL || (this.inputmode === INPUTMODE.FINANCIAL && this.ngModelOptions.updateOn === 'blur')) {
            this.datavalue = $event;
        }
    }

    onPropertyChange(key, nv, ov?) {
        if (key === 'minvalue' || key === 'maxvalue') {
            this.isValid(nv);
        } else if (key === 'datavalue' && !ov) {
            if (this.isNaturalCurrency()) {
                this.checkForTrailingZeros({type: 'blur'});
            } else {
                this.onInputChange(nv);
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
