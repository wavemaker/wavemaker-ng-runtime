import { WmComponentsModule } from "@wm/components/base";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DateTimePickerComponent } from '../date-time/date-time-picker.component';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    NgZone,
    OnDestroy,
    Optional,
    ViewChild
} from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BsDatepickerDirective, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerConfig, TimepickerModule } from 'ngx-bootstrap/timepicker';

import {
    AbstractI18nService,
    addClass,
    addEventListenerOnElement,
    adjustContainerPosition,
    adjustContainerRightEdges,
    App,
    AppDefaults,
    EVENT_LIFE,
    FormWidgetType,
    getDateObj,
    getDisplayDateTimeFormat,
    getFormattedDate,
    getMomentLocaleObject,
    getNativeDateObject
} from '@wm/core';
import { provideAs, provideAsWidgetRef, setFocusTrap, styler } from '@wm/components/base';

import { BaseDateTimeComponent, getTimepickerConfig } from './../base-date-time.component';
import { registerProps } from './date-time.props';
import { debounce, forEach, includes, isNaN, parseInt } from "lodash-es";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";

declare const $;
import * as momentLib  from 'moment';
const moment = momentLib.default || window['moment'];

const DEFAULT_CLS = 'app-datetime input-group';
const WIDGET_CONFIG = { widgetType: 'wm-datetime', hostClass: DEFAULT_CLS };

const CURRENT_DATE = 'CURRENT_DATE';

@Component({
    standalone: true,
    imports: [WmComponentsModule, FormsModule, DateTimePickerComponent, BsDropdownModule, BsDatepickerModule, TimepickerModule,CommonModule],
    selector: '[wmDateTime]',
    templateUrl: './date-time.component.html',
    providers: [
        provideAs(DatetimeComponent, NG_VALUE_ACCESSOR, true),
        provideAs(DatetimeComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(DatetimeComponent),
        { provide: TimepickerConfig, deps: [AbstractI18nService], useFactory: getTimepickerConfig }
    ]
})
export class DatetimeComponent extends BaseDateTimeComponent implements AfterViewInit, OnDestroy {
    static initializeProps = registerProps();
    /**
     * The below propeties prefixed with "bs" always holds the value that is selected from the datepicker.
     * The bsDateTimeValue = bsDateValue + bsTimeValue.
     */
    private bsDateTimeValue: any;
    public bsDateValue;
    private bsTimeValue;
    private proxyModel;
    private app: App;
    public hint: string;
    public arialabel: string;
    public showdropdownon: string;
    private deregisterDatepickerEventListener;
    private deregisterTimepickeEventListener;
    private isEnterPressedOnDateInput = false;
    private focusTrap;

    get timestamp() {
        return this.proxyModel ? this.proxyModel.valueOf() : undefined;
    }

    get dateInputFormat() {
        return this._dateOptions.dateInputFormat || 'yyyy-MM-ddTHH:mm:ss';
    }

    /**
     * The displayValue is the display value of the bsDateTimeValue after applying the datePattern on it.
     * @returns {any|string}
     */
    get displayValue(): any {
        return getFormattedDate(this.datePipe, this.proxyModel, this.dateInputFormat, this.timeZone, (this as any).key, this.isCurrentDate, this) || '';
    }

    get nativeDisplayValue() {
        return getFormattedDate(this.datePipe, this.proxyModel, 'yyyy-MM-ddTHH:mm:ss', this.timeZone, (this as any).key, this.isCurrentDate, this) || '';
    }

    @ViewChild(BsDatepickerDirective) bsDatePickerDirective;

    /**
     * This property checks if the timePicker is Open
     */
    public isTimeOpen = false;

    /**
     * This property checks if the datePicker is Open
     */
    public isDateOpen = false;

    /**
     * This timeinterval is used to run the timer when the time component value is set to CURRENT_TIME in properties panel.
     */
    private timeinterval: any;

    /**
     * This property is set to TRUE if the time component value is set to CURRENT_TIME; In this case the timer keeps changing the time value until the widget is available.
     */
    public isCurrentDate = false;

    private _debouncedOnChange: Function = debounce(this.invokeOnChange, 10);

    private dateContainerCls: string;

    // @ts-ignore
    get datavalue(): any {
        if (this.isCurrentDate && !this.proxyModel) {
            return CURRENT_DATE;
        }
        return getFormattedDate(this.datePipe, this.proxyModel, this.outputformat, this.timeZone, null, null, this);
    }

    /**Todo[Shubham]: needs to be redefined
     * This property sets the default value for the date selection
     */
    // @ts-ignore
    set datavalue(newVal: any) {
        if (newVal === CURRENT_DATE) {
            this.isCurrentDate = true;
            this.setTimeInterval();
        } else {
            this.proxyModel = newVal ? getDateObj(newVal, { isNativePicker: this.loadNativeDateInput }, this.timeZone) : undefined;
            this.clearTimeInterval();
            this.isCurrentDate = false;
        }
        this.bsTimeValue = this.bsDateValue = this.proxyModel;
        this.cdRef.detectChanges();
    }

    constructor(
        inj: Injector,
        private ngZone: NgZone,
        private cdRef: ChangeDetectorRef,
        private appDefaults: AppDefaults,
        app: App,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        super(inj, WIDGET_CONFIG, explicitContext);
        this.registerDestroyListener(() => this.clearTimeInterval());
        styler(this.nativeElement, this);
        this.app = app;
        this.dateContainerCls = `app-date-${this.widgetId}`;
        this._dateOptions.containerClass = `app-date ${this.dateContainerCls}`;
        this._dateOptions.showWeekNumbers = false;
        this.datepattern = this.appDefaults.dateTimeFormat || getDisplayDateTimeFormat(FormWidgetType.DATETIME);
        this.updateFormat('datepattern');
    }

    /**
     * This is an internal method used to maintain a time interval to update the time model when the data value is set to CURRENT_TIME
     */
    private setTimeInterval() {
        if (this.timeinterval) {
            return;
        }
        this.timeinterval = setInterval(() => {
            const currentTime = this.timeZone ? getMomentLocaleObject(this.timeZone) : new Date();
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
    public toggleTimePicker(newVal, $event?: any) {
        if (this.loadNativeDateInput) {
            this.onDateTimeInputFocus();
            return;
        }
        this.isTimeOpen = newVal;
        if ($event && $event.type === 'click') {
            this.invokeEventCallback('click', { $event: $event });
        }
        this.addTimepickerClickListener(this.isTimeOpen);
    }

    private addTimepickerClickListener(skipListener) {
        if (!skipListener) {
            return;
        }
        const bodyElement = document.querySelector('body');
        setTimeout(() => {
            const dropdownElement = $(bodyElement).find('>bs-dropdown-container .dropdown-menu').get(0);
            this.deregisterTimepickeEventListener = addEventListenerOnElement(bodyElement, dropdownElement, this.nativeElement, 'click', this.isDropDownDisplayEnabledOnInput(this.showdropdownon), () => {
                this.toggleTimePicker(false);
            }, EVENT_LIFE.ONCE, true);
        }, 350);
    }

    /**
     * This function sets the value isOpen/isTimeOpen (i.e when datepicker popup is closed) based on widget type(i.e  DateTime, Time)
     * @param val - isOpen/isTimeOpen is set based on the timepicker popup is open/closed
     */
    private setIsTimeOpen(val: boolean) {
        this.isTimeOpen = val;
    }

    private hideTimepickerDropdown() {
        this.invokeOnTouched();
        this.toggleTimePicker(false);
        if (this.deregisterTimepickeEventListener) {
            this.deregisterTimepickeEventListener();
        }
        const parentEl = $(this.nativeElement).closest('.app-composite-widget.caption-floating');
        if (parentEl.length > 0) {
            this.app.notify('captionPositionAnimate', { displayVal: this.displayValue, nativeEl: parentEl });
        }
    }

    /**
     * This is an internal method to add a click listener once the time dropdown is open
     */
    public onTimepickerOpen() {
        // adding class for time widget dropdown menu
        const tpElements = document.querySelectorAll('timepicker');
        forEach(tpElements, (element) => {
            addClass(element.parentElement as HTMLElement, 'app-datetime', true);
        });
        if (this.bsDropdown && (this.dateNotInRange || this.invalidDateTimeFormat)) {
            this.bsTimeValue = null;
        }
        this.bsDatePickerDirective.hide();
        this.focusTimePickerPopover(this);
        this.bindTimePickerKeyboardEvents();
        adjustContainerPosition($('bs-dropdown-container'), this.nativeElement, this.bsDropdown._dropdown, $('bs-dropdown-container .dropdown-menu'));
        adjustContainerRightEdges($('bs-dropdown-container'), this.nativeElement, this.bsDropdown._dropdown, $('bs-dropdown-container .dropdown-menu'));
    }

    public onDatePickerOpen() {
        this.isDateOpen = !this.isDateOpen;
        this.toggleTimePicker(false);
        // We are using the two input tags(To maintain the modal and proxy modal) for the date control.
        // So actual bootstrap input target width we made it to 0 so bootstrap calculating the calendar container top position impropery.
        // To fix the container top position set the width 1px;
        this.$element.find('.model-holder').width('1px');
        const dpContainerEl = $('bs-datepicker-container');
        dpContainerEl.attr('aria-label', 'Use Arrow keys to navigate dates, Choose Date from datepicker');
        $('.bs-calendar-container').removeAttr('role');
        const datePickerContainer = $('.bs-datepicker-container')[0];
        this.focusTrap = setFocusTrap(datePickerContainer, true);
        this.focusTrap.activate();

        this.bsDateValue ? this.activeDate = this.bsDateValue : this.activeDate = new Date();
        if (!this.bsDateValue) {
            this.hightlightToday(this.activeDate);
        }
        this.addDatepickerKeyboardEvents(this, true);
        adjustContainerPosition($('bs-datepicker-container'), this.nativeElement, this.bsDatePickerDirective._datepicker);
    }

    /**
     * This is an internal method to update the model
     */
    public onModelUpdate(newVal, type?) {

        if (type === 'date') {
            this.invalidDateTimeFormat = false;
            if (getFormattedDate(this.datePipe, newVal, this.dateInputFormat, this.timeZone, (this as any).key, this.isCurrentDate, this) === this.displayValue) {
                $(this.nativeElement).find('.display-input').val(this.displayValue);
            }
        }

        if (newVal && !this.bsDateValue && this.timeZone) {
            newVal = getMomentLocaleObject(this.timeZone, newVal);
        }
        // min date and max date validation in web.
        // if invalid dates are entered, device is showing validation message.
        this.minDateMaxDateValidationOnInput(newVal);
        if (!newVal) {
            // Set timevalue as 00:00:00 if we remove any one from hours/minutes/seconds field in timepicker after selecting date
            if (this.bsDateValue && this.bsTimePicker && (this.bsTimePicker.hours === '' || this.bsTimePicker.minutes === '' || this.bsTimePicker.seconds === '')) {
                this.bsDateValue = this.bsTimeValue = this.proxyModel = moment(this.bsDateValue).startOf('day').toDate();
            } else {
                this.bsDateValue = this.bsTimeValue = this.proxyModel = undefined;
            }
            // When the datavalue is manually cleared, both newval and datavalue are undefined but prevDataValue exists - trigger change cb
            if (newVal !== this.datavalue || (!this.datavalue && (this as any).prevDatavalue)) {
                this._debouncedOnChange(this.datavalue, {}, true);
            }
            return;
        }
        if (type === 'date') {
            if (this.isDateOpen) {
                this.toggleTimePicker(true);
            }
        }
        if (!this.dateNotInRange && !this.invalidDateTimeFormat) {
            this.proxyModel = newVal;
            if (this.proxyModel) {
                this.bsDateValue = this.bsTimeValue = newVal;
            }
            if(this.datavalue=== this.getPrevDataValue()){
                const time=getFormattedDate(this.datePipe, this.datavalue, this.datepattern, this.timeZone, null, null, this) || ''
                $(this.nativeElement).find('.display-input').val(time);}
        }else {
            this.proxyModel = newVal;
        }
        this._debouncedOnChange(this.datavalue, {}, true);
        this.cdRef.detectChanges();

        // Update timepicker with formatted time, when timezone is provided.
        const timePickerFields = $('.bs-timepicker-field');
        if (this.timeZone && (this as any).key === 'datetimestamp' && timePickerFields.length) {
            const formattedDate = getFormattedDate(this.datePipe, newVal, this.getTimePattern(), this.timeZone, (this as any).key, null, this);
            this.updateTimepickerFields(formattedDate, timePickerFields);
        }
    }

    // deduces the timepattern from datepattern set in the studio
    private getTimePattern() {
        let timepattern;
        const timePatternStartIndex = this.datepattern.toLowerCase().indexOf('h');
        let timePatternEndIndex = this.datepattern.toLowerCase().indexOf(':ss');
        if (timePatternEndIndex > -1) {
            // adding the index to +3 to incluse :ss
            timePatternEndIndex += 3;
        } else {
            timePatternEndIndex = this.datepattern.toLowerCase().indexOf(':mm');
            // adding the index to +3 to incluse :mm
            if (timePatternEndIndex > -1) {
                timePatternEndIndex += 3;
            }
        }
        const hasMeridian = this.datepattern.toLowerCase().indexOf('a');
        timepattern = this.datepattern.substr(timePatternStartIndex, timePatternEndIndex);
        if (hasMeridian > -1)
            timepattern += ' a';
        return timepattern;
    }

    private updateTimepickerFields(date, timePickerFields) {
        const meridianField = $('timepicker button.text-center');
        const formattedArr = date.split(' ');
        const formattedTime = formattedArr[0].split(':');
        for (let i = 0; i < timePickerFields.length; i++) {
            timePickerFields[i].value = formattedTime[i]
        }
        if (meridianField?.html()?.trim() !== formattedArr[1]) {
            meridianField.text(formattedArr[1]);
        }
    }

    /**
     * This is an internal method used to Prevent time picker close while changing time value
     */
    private preventTpClose($event) {
        $event.stopImmediatePropagation();
    }

    /**
     * This is an internal method used to toggle the dropdown of the date widget
     */
    public toggleDpDropdown($event, skipFocus: boolean = false) {
        if (this.loadNativeDateInput) {
            //Fixes click event getting triggred twice in Mobile devices.
            if (!skipFocus) {
                this.onDateTimeInputFocus();
            }
            return;
        }
        if ($event.type === 'click') {
            this.invokeEventCallback('click', { $event: $event });
            //this.focusOnInputEl();
        }
        if ($event.target && $($event.target).is('input') && !(this.isDropDownDisplayEnabledOnInput(this.showdropdownon))) {
            $event.stopPropagation();
            return;
        }
        if (this.bsDatePickerDirective && (this.dateNotInRange||this.invalidDateTimeFormat)) {
            this.bsDatePickerDirective._bsValue = null;
        }
        this.bsDatePickerDirective.toggle();
        this.addBodyClickListener(this.bsDatePickerDirective.isOpen);
    }

    private addBodyClickListener(skipListener) {
        if (!skipListener) {
            return;
        }
        const bodyElement = document.querySelector('body');
        setTimeout(() => {
            const bsDateContainerElement = bodyElement.querySelector(`.${this.dateContainerCls}`);
            this.deregisterDatepickerEventListener = addEventListenerOnElement(bodyElement, bsDateContainerElement, this.nativeElement, 'click', this.isDropDownDisplayEnabledOnInput(this.showdropdownon), () => {
                this.bsDatePickerDirective.hide();
            }, EVENT_LIFE.ONCE, true);
        }, 350);
    }

    public hideDatepickerDropdown() {
        this.isDateOpen = false;
        this.focusTrap?.deactivate();
        this.invokeOnTouched();
        this.bsDatePickerDirective.hide();

        // To open the timepicker menu when user wants to update time without changing the date.
        if (this.bsDateValue) {
            this.toggleTimePicker(true);
        }
        this.isEnterPressedOnDateInput = false;
        if (this.deregisterDatepickerEventListener) {
            this.deregisterDatepickerEventListener();
        }
        const parentEl = $(this.nativeElement).closest('.app-composite-widget.caption-floating');
        if (parentEl.length > 0) {
            this.app.notify('captionPositionAnimate', { displayVal: this.displayValue, nativeEl: parentEl });
        }
        this.blurDateInput(this.isDateOpen);
    }

    public onDateChange($event, isNativePicker?: boolean) {
        if (this.isEnterPressedOnDateInput) {
            this.isEnterPressedOnDateInput = false;
            return;
        }
        let newVal = $event.target.value.trim();
        newVal = newVal ? getNativeDateObject(newVal, { pattern: this.loadNativeDateInput ? this.outputformat : this.datepattern, meridians: this.meridians, isNativePicker: this.loadNativeDateInput }) : undefined;
        // datetime pattern validation
        // if invalid pattern is entered, device is showing an error.
        if (!this.formatValidation(newVal, $event.target.value, isNativePicker)) {
            return;
        }
        // min date and max date validation in mobile view.
        // if invalid dates are entered, device is showing an alert.
        if (isNativePicker && this.minDateMaxDateValidationOnInput(newVal, $event, this.displayValue, isNativePicker)) {
            return;
        }
        this.invalidDateTimeFormat = false;
        this.onModelUpdate(newVal);
    }

    /**
     * This is an internal method triggered when pressing key on the datetime input
     */
    public onDisplayKeydown(event) {
        if (this.isDropDownDisplayEnabledOnInput(this.showdropdownon)) {
            event.stopPropagation();
            let newVal = event.target.value.trim();
            if (event.key === 'Enter' || event.key === 'ArrowDown') {
                newVal = newVal ? getNativeDateObject(newVal, { pattern: this.loadNativeDateInput ? this.outputformat : this.datepattern, meridians: this.meridians }) : undefined;
                event.preventDefault();
                const formattedDate = getFormattedDate(this.datePipe, newVal, this.dateInputFormat, this.timeZone, (this as any).key, this.isCurrentDate, this);
                const inputVal = event.target.value.trim();
                if (inputVal && this.datepattern === 'timestamp') {
                    if (!isNaN(inputVal) && parseInt(inputVal) !== formattedDate) {
                        this.invalidDateTimeFormat = true;
                        this.invokeOnChange(this.datavalue, event, false);
                    }
                } else if (inputVal && inputVal !== formattedDate) {
                    this.invalidDateTimeFormat = true;
                    this.invokeOnChange(this.datavalue, event, false);
                } else {
                    this.invalidDateTimeFormat = false;
                    this.isEnterPressedOnDateInput = true;
                    this.bsDatePickerDirective.bsValue = newVal;
                }
                this.toggleDpDropdown(event);
            } else {
                this.hideDatepickerDropdown();
                this.hideTimepickerDropdown();
            }
        } else {
            this.hideDatepickerDropdown();
            this.hideTimepickerDropdown();
        }
    }

    private isValid(event) {
        if (!event) {
            const enteredDate = $(this.nativeElement).find('input').val();
            const newVal = getNativeDateObject(enteredDate, { pattern: this.loadNativeDateInput ? this.outputformat : this.datepattern, meridians: this.meridians, isNativePicker: this.loadNativeDateInput });
            if (!this.formatValidation(newVal, enteredDate)) {
                return;
            }
        }
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (!includes(['blur', 'focus', 'change', 'click'], eventName)) {
            super.handleEvent(node, eventName, callback, locals);
        }
    }

    onInputBlur($event) {
        if (!$($event.relatedTarget).hasClass('current-date')) {
            this.invokeOnTouched();
            this.invokeEventCallback('blur', { $event });
        }
    }
}
