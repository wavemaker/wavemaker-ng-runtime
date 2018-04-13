import { ChangeDetectorRef, Component, ElementRef, Injector } from '@angular/core';
import { $appDigest, addEventListener, EVENT_LIFE, getFormattedDate } from '@wm/utils';
import { styler } from '../../utils/styler';
import { registerProps } from './date-time.props';
import { getControlValueAccessor, invokeEventHandler } from '../../utils/widget-utils';
import { BaseFormComponent } from '../base/base-form.component';
import { ToDatePipe } from '../../pipes/custom-pipes';

const DEFAULT_CLS = 'app-datetime input-group';
const WIDGET_CONFIG = {widgetType: 'wm-datetime', hostClass: DEFAULT_CLS};

const now: Date = new Date();
const CURRENT_DATE: string = 'CURRENT_DATE';

registerProps();
@Component({
    selector: '[wmDateTime]',
    templateUrl: './date-time.component.html',
    providers: [getControlValueAccessor(DatetimeComponent)]
})
export class DatetimeComponent extends BaseFormComponent {
    /**
     * This property sets the widget to readonly mode
     */
    readonly: boolean;
    /**
     * This property sets the widget to disabled mode
     */
    disabled: boolean;
    /**
     * This is an internal property used to map it to the widget, Sets the value to true if readonly or disabled is true
     */
    get isDisabled () {
        return this.disabled || this.readonly || this.isCurrentDate;
    }
    /**
     * This property sets the display pattern of the date selected
     */
    datepattern: string;
    private datePattern;
    /**
     * This property sets the output format for the selected date datavalue
     */
    outputformat: string;
    timestamp;
    private outputFormat;

    get datavalue(): any {
        return getFormattedDate(this.datePipe, this.proxyModel, this.outputformat);
    }
    /**
     * This property sets the default value for the date selection
     */
    set datavalue(newVal: any) {
        this._datavalue = newVal;
        if (newVal === CURRENT_DATE) {
            this.isCurrentDate = true;
            this.setTimeInterval();
            return;
        }
        this.isCurrentDate = false;
        this.clearTimeInterval();

        if (newVal) {
            this.dateModel = this.dateModel || this.getDateObj(newVal);
            this.timeModel = this.timeModel || this.getDateObj(newVal);
            this.proxyModel = this.getDateObj(newVal);
            this.formattedModel = getFormattedDate(this.datePipe, this.proxyModel, this.datepattern);
            this.timestamp = this.proxyModel.valueOf();
        } else {
            this.dateModel = this.timeModel = this.proxyModel = this.timestamp = this.formattedModel = undefined;
        }
        this.invokeOnChange(this.datavalue);
        $appDigest();
    }
    private timeinterval: any;
    /**
     * This is an internal property used to map it to the widget
     */
    private minDate: Date;
    /**
     * This is an internal property used to map it to the widget
     */
    private maxDate: Date;
    /**
     * This is an internal property used to map the main model to the bsDatewidget
     */
    private proxyModel: any;
    /**
     * This is an internal property used to map the formattedModel to the date display
     */
    private formattedModel: string;
    /**
     * This is an internal property used to map the containerClass, showWeekNumbers etc., to the bsDatepicker
     */
    private _dateOptions: any = {
        'containerClass': 'theme-red',
        'showWeekNumbers': false
    };

    /* Internal property to have a flag to check the given datavalue is of Current time*/
    private isCurrentTime: boolean;

    /**
     * This is an internal property used to map it to the widget
     */
    private minTime: Date;
    /**
     * This is an internal property used to map it to the widget
     */
    private maxTime: Date;
    /**
     * This property checks if the timePicker is Open
     */
    private isTimeOpen: boolean = false;
    /**
     * This property checks if the timePicker is Open
     */
    private isCurrentDate: boolean = false;
    /**
     * This property is to internally map the selected Date from the date picker
     */
    private selectedDate;
    /**
     * This property is to internally map the selected time from the time picker
     */
    private selectedTime;

    private _datavalue;

    private dateModel;
    private timeModel;
    isDateOpen = false;
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
    }
    /**
     * This is an internal method to add a click listener once the time dropdown is open
     */
    private addClickListener(value) {
        setTimeout(() => {
            const dropdownElement = this.$element.querySelector('.dropdown-menu');
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
            invokeEventHandler(this, 'change', {$event: newVal, newVal: undefined, oldVal: this.proxyModel});
            this.proxyModel = undefined;
            this.invokeOnChange(this.datavalue);
            return;
        }
        const dateObj = this.getDateObj(newVal);
        invokeEventHandler(this, 'change', {$event: newVal, newVal: dateObj, oldVal: this.proxyModel});
        if (type === 'date') {
            this.selectedDate = dateObj.toDateString();
            if (this.isDateOpen) {
                this.toggleTimePicker(true);
            }
            if (!this.selectedTime) {
                this.selectedTime = dateObj.toTimeString();
            }
            this.proxyModel = new Date(`${this.selectedDate} ${this.selectedTime}`);
        } else {
            this.selectedTime = dateObj.toTimeString();
            if (!this.selectedDate) {
                this.selectedDate = dateObj.toDateString();
            }
            this.proxyModel = new Date(`${this.selectedDate} ${this.selectedTime}`);
        }
        this.formattedModel = getFormattedDate(this.datePipe, this.proxyModel, this.datepattern);
        this.invokeOnChange(this.datavalue);
        $appDigest();
    }
    /**
     * This is an internal method to get the date object from the input received
     */
    private getDateObj(value?: string): Date {
        const dateObj = new Date(value);
        if (value === CURRENT_DATE || isNaN(dateObj.getDay())) {
            return now;
        }
        return dateObj;
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, public datePipe: ToDatePipe) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        this.destroy$.subscribe(() => {
            this.clearTimeInterval();
        });
        styler(this.$element, this);
    }

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'datepattern':
                this.datePattern = newVal;
                this.datavalue = this._datavalue;
                break;
            case 'outputformat':
                this.outputFormat = newVal;
                this.datavalue = this._datavalue;
                break;
            case 'mindate':
                this.minDate = this.getDateObj(newVal);
                break;
            case 'maxdate':
                this.maxDate = this.getDateObj(newVal);
                break;
            case 'showweeks':
                this._dateOptions.showWeekNumbers = newVal;
                break;
        }
    }
}
