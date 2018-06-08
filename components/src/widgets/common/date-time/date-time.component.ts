import { Component, Injector } from '@angular/core';

import { $appDigest, addEventListener, EVENT_LIFE, getDateObj, getFormattedDate } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './date-time.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
import { BsDatepickerConfig } from 'ngx-bootstrap';

const DEFAULT_CLS = 'app-datetime input-group';
const WIDGET_CONFIG = {widgetType: 'wm-datetime', hostClass: DEFAULT_CLS};

const now: Date = new Date();
const CURRENT_DATE: string = 'CURRENT_DATE';

registerProps();
@Component({
    selector: '[wmDateTime]',
    templateUrl: './date-time.component.html',
    providers: [
        provideAsNgValueAccessor(DatetimeComponent),
        provideAsWidgetRef(DatetimeComponent)
    ]
})
export class DatetimeComponent extends BaseFormCustomComponent {
    /**
     * This property sets the output format for the selected date datavalue. This widget's output will always be the formatted value using this format.
     */
    outputformat: string;

    /**
     * The below propeties prefixed with "bs" always holds the value that is selected from the datepicker.
     * The bsDateTimeValue = bsDateValue + bsTimeValue.
     */
    private bsDateTimeValue: any;
    private bsDateValue;
    private bsTimeValue;

    get timestamp() {
        return this.bsDateTimeValue ? this.bsDateTimeValue.valueOf() : undefined;
    }

    /**
     * The displayValue is the display value of the bsDateTimeValue after applying the datePattern on it.
     * @returns {any|string}
     */
    get displayValue(): any {
        return getFormattedDate(this.datePipe, this.bsDateTimeValue, this._dateOptions.dateInputFormat) || '';
    }

    /**
     * This property checks if the timePicker is Open
     */
    private isTimeOpen: boolean = false;

    /**
     * This property checks if the datePicker is Open
     */
    private isDateOpen = false;

    /**
     * This timeinterval is used to run the timer when the time component value is set to CURRENT_TIME in properties panel.
     */
    private timeinterval: any;

    /**
     * This property is set to TRUE if the time component value is set to CURRENT_TIME; In this case the timer keeps changing the time value until the widget is available.
     */
    private isCurrentDate: boolean = false;

    /**
     * This is an internal property used to map the containerClass, showWeekNumbers etc., to the bsDatepicker
     */
    private _dateOptions: BsDatepickerConfig = new BsDatepickerConfig();

    get datavalue(): any {
        return getFormattedDate(this.datePipe, this.bsDateTimeValue, this.outputformat);
    }

    /**Todo[Shubham]: needs to be redefined
     * This property sets the default value for the date selection
     */
    set datavalue(newVal: any) {
        if (newVal === CURRENT_DATE) {
            this.isCurrentDate = true;
            this.setTimeInterval();
            return;
        }
        this.isCurrentDate = false;
        this.clearTimeInterval();

        if (newVal) {
            this.bsDateValue = this.bsDateValue || getDateObj(newVal);
            this.bsTimeValue = this.bsTimeValue || getDateObj(newVal);
            this.bsDateTimeValue = getDateObj(newVal);
        } else {
            this.bsDateValue = this.bsTimeValue = this.bsDateTimeValue = undefined;
        }
        this.invokeOnChange(this.datavalue);
        $appDigest();
    }

    constructor(inj: Injector, public datePipe: ToDatePipe) {
        super(inj, WIDGET_CONFIG);
        this.registerDestroyListener(() => this.clearTimeInterval());
        styler(this.nativeElement, this);
        this._dateOptions.containerClass = 'theme-red';
        this._dateOptions.showWeekNumbers = false;
    }

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'datepattern':
                this._dateOptions.dateInputFormat = newVal;
                break;
            case 'outputformat':
                this.outputformat = newVal;
                break;
            case 'mindate':
                this._dateOptions.minDate = getDateObj(newVal);
                break;
            case 'maxdate':
                this._dateOptions.maxDate = getDateObj(newVal);
                break;
            case 'showweeks':
                this._dateOptions.showWeekNumbers = newVal;
                break;
        }
    }

    /**
     * This is an internal method used to maintain a time interval to update the time model when the data value is set to CURRENT_TIME
     */
    private setTimeInterval() {
        if (this.timeinterval) {
            return;
        }
        this.timeinterval = setInterval( () => {
            const currentTime = new Date();
            this.onModelUpdate(currentTime);
        }, 1000);
    }

    /**
     * This is an internal method used to clear the time interval created
     */
    private clearTimeInterval() {
        if (this.timeinterval) {
            clearInterval(this.timeinterval);
            this.timeinterval = null;
        }
    }

    /**
     * This is an internal method to toggle the time picker
     */
    private toggleTimePicker(newVal) {
        this.isTimeOpen = newVal;
        this.invokeOnTouched();
    }

    /**
     * This is an internal method to add a click listener once the time dropdown is open
     */
    private addClickListener(value) {
        setTimeout(() => {
            const dropdownElement = this.nativeElement.querySelector('.dropdown-menu');
            const bodyElement = document.querySelector('body');
            addEventListener(bodyElement, dropdownElement, 'click', () => {
                this.toggleTimePicker(false);
            }, EVENT_LIFE.ONCE);
        }, 350);
    }

    onDatePickerOpen() {
        this.isDateOpen = !this.isDateOpen;
        this.invokeOnTouched();
    }

    /**
     * This is an internal method to update the model
     */
    private onModelUpdate(newVal, type?) {
        if (!newVal) {
            this.bsDateTimeValue = undefined;
            this.invokeOnChange(this.datavalue, {}, true); // Todo[Shubham]: should pass event as second param(not supported by lib presently)
            return;
        }
        const dateObj = getDateObj(newVal);
        if (type === 'date') {
            this.bsDateValue = dateObj.toDateString();
            this.bsTimeValue = dateObj.toTimeString();
            if (this.isDateOpen) {
                this.toggleTimePicker(true);
            }
            this.bsDateTimeValue = new Date(`${this.bsDateValue} ${this.bsTimeValue}`);
        } else {
            this.bsTimeValue = dateObj.toTimeString();
            if (!this.bsDateValue) {
                this.bsDateValue = dateObj.toDateString();
            }
            this.bsDateTimeValue = new Date(`${this.bsDateValue} ${this.bsTimeValue}`);
        }
        this.invokeOnChange(this.datavalue, {}, true);
        $appDigest();
    }
}
