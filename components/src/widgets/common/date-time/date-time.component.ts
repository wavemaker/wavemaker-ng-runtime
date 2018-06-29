import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnDestroy, ViewChild } from '@angular/core';

import { BsDatepickerDirective } from 'ngx-bootstrap';

import { $appDigest, addClass, addEventListener, EVENT_LIFE, getDateObj, getFormattedDate, setAttr } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './date-time.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { BaseDateTimeComponent } from '../base/base-date-time.component';

const DEFAULT_CLS = 'app-datetime input-group';
const WIDGET_CONFIG = {widgetType: 'wm-datetime', hostClass: DEFAULT_CLS};

const now: Date = new Date();
const CURRENT_DATE: string = 'CURRENT_DATE';

declare const _;

registerProps();
@Component({
    selector: '[wmDateTime]',
    templateUrl: './date-time.component.html',
    providers: [
        provideAsNgValueAccessor(DatetimeComponent),
        provideAsWidgetRef(DatetimeComponent)
    ]
})
export class DatetimeComponent extends BaseDateTimeComponent implements AfterViewInit, OnDestroy {

    /**
     * The below propeties prefixed with "bs" always holds the value that is selected from the datepicker.
     * The bsDateTimeValue = bsDateValue + bsTimeValue.
     */
    private bsDateTimeValue: any;
    private bsDateValue;
    private bsTimeValue;
    private showseconds: boolean;

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

    @ViewChild(BsDatepickerDirective) bsDatePickerDirective;

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
        this.cdRef.detectChanges();
    }

    constructor(inj: Injector, public datePipe: ToDatePipe, private cdRef: ChangeDetectorRef) {
        super(inj, WIDGET_CONFIG);
        this.registerDestroyListener(() => this.clearTimeInterval());
        styler(this.nativeElement, this);
        this._dateOptions.containerClass = 'theme-red';
        this._dateOptions.showWeekNumbers = false;
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
        // adding class for time widget dropdown menu
        const tpElements  = document.querySelectorAll('timepicker');
        _.forEach(tpElements, (element) => {
            addClass(element.parentElement as HTMLElement, 'app-datetime');
        });

        setTimeout(() => {
            const dropdownElement = this.nativeElement.querySelector('.dropdown-menu');
            const bodyElement = document.querySelector('body');
            addEventListener(bodyElement, dropdownElement, 'click', () => {
                this.toggleTimePicker(false);
            }, EVENT_LIFE.ONCE);
        }, 350);
    }

    private onDatePickerOpen() {
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
    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'autofocus' && nv) {
            const inputElement = this.$element.find('.display-input')[0] as HTMLElement;
            setAttr(inputElement, key, nv);
        }
        if (key === 'datepattern') {
            this.showseconds = _.includes(nv, 'ss');
        }
        super.onPropertyChange(key, nv, ov);
    }
}
