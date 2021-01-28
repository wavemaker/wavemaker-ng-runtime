import { AfterViewInit, ChangeDetectorRef, Component, Inject, Injector, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';

import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { TimepickerConfig } from 'ngx-bootstrap/timepicker';

import { AbstractI18nService, addClass, addEventListenerOnElement, adjustContainerPosition, AppDefaults, EVENT_LIFE, FormWidgetType, getDateObj, getDisplayDateTimeFormat, getFormattedDate, getNativeDateObject, adjustContainerRightEdges, isMobile, App } from '@wm/core';
import { provideAsWidgetRef, provideAs, styler } from '@wm/components/base';

import {BaseDateTimeComponent, getTimepickerConfig} from './../base-date-time.component';
import { registerProps } from './date-time.props';

declare const moment, $, _;

const DEFAULT_CLS = 'app-datetime input-group';
const WIDGET_CONFIG = { widgetType: 'wm-datetime', hostClass: DEFAULT_CLS };

const CURRENT_DATE = 'CURRENT_DATE';

@Component({
    selector: '[wmDateTime]',
    templateUrl: './date-time.component.html',
    providers: [
        provideAs(DatetimeComponent, NG_VALUE_ACCESSOR, true),
        provideAs(DatetimeComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(DatetimeComponent),
        { provide: TimepickerConfig,  deps: [AbstractI18nService], useFactory: getTimepickerConfig }
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

    public showdropdownon: string;
    private keyEventPlugin;
    private deregisterDatepickerEventListener;
    private deregisterTimepickeEventListener;
    private isEnterPressedOnDateInput = false;

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
        return getFormattedDate(this.datePipe, this.proxyModel, this.dateInputFormat) || '';
    }

    get nativeDisplayValue() {
        return getFormattedDate(this.datePipe, this.proxyModel, 'yyyy-MM-ddTHH:mm:ss') || '';
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

    private _debouncedOnChange: Function = _.debounce(this.invokeOnChange, 10);

    private dateContainerCls: string;

    get datavalue(): any {
        if (this.isCurrentDate && !this.proxyModel) {
            return CURRENT_DATE;
        }
        return getFormattedDate(this.datePipe, this.proxyModel, this.outputformat);
    }

    /**Todo[Shubham]: needs to be redefined
     * This property sets the default value for the date selection
     */
    set datavalue(newVal: any) {
        if (newVal === CURRENT_DATE) {
            this.isCurrentDate = true;
            this.setTimeInterval();
        } else {
            this.proxyModel = newVal ? getDateObj(newVal) : undefined;
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
        @Inject(EVENT_MANAGER_PLUGINS) evtMngrPlugins
    ) {
        super(inj, WIDGET_CONFIG);
        this.registerDestroyListener(() => this.clearTimeInterval());
        styler(this.nativeElement, this);
        this.app = app;
        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1];
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
    public toggleTimePicker(newVal, $event?: any) {
        if (isMobile()) {
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
            this.app.notify('captionPositionAnimate', {displayVal: this.displayValue, nativeEl: parentEl});
        }
    }

    /**
     * This is an internal method to add a click listener once the time dropdown is open
     */
    public onTimepickerOpen() {
        // adding class for time widget dropdown menu
        const tpElements = document.querySelectorAll('timepicker');
        _.forEach(tpElements, (element) => {
            addClass(element.parentElement as HTMLElement, 'app-datetime', true);
        });

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

        this.bsDateValue ? this.activeDate = this.bsDateValue : this.activeDate = new Date();
        if (!this.bsDateValue) {
            this.hightlightToday();
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
            if (getFormattedDate(this.datePipe, newVal, this.dateInputFormat) === this.displayValue) {
                $(this.nativeElement).find('.display-input').val(this.displayValue);
            }
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
            this._debouncedOnChange(this.datavalue, {}, true);
            return;
        }
        if (type === 'date') {
            if (this.isDateOpen) {
                this.toggleTimePicker(true);
            }
        }
        this.proxyModel = newVal;
        if (this.proxyModel) {
            this.bsDateValue = this.bsTimeValue = this.proxyModel;
        }
        this._debouncedOnChange(this.datavalue, {}, true);
        this.cdRef.detectChanges();
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
    public toggleDpDropdown($event) {
        if (isMobile()) {
            this.onDateTimeInputFocus();
            return;
        }
        if ($event.type === 'click') {
            this.invokeEventCallback('click', { $event: $event });
        }
        if ($event.target && $($event.target).is('input') && !(this.isDropDownDisplayEnabledOnInput(this.showdropdownon))) {
            $event.stopPropagation();
            return;
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
        this.invokeOnTouched();
        this.bsDatePickerDirective.hide();
        this.isEnterPressedOnDateInput = false;
        if (this.deregisterDatepickerEventListener) {
            this.deregisterDatepickerEventListener();
        }
        const parentEl = $(this.nativeElement).closest('.app-composite-widget.caption-floating');
        if (parentEl.length > 0) {
            this.app.notify('captionPositionAnimate', {displayVal: this.displayValue, nativeEl: parentEl});
        }
    }

    public onDateChange($event, isNativePicker?: boolean) {
        if (this.isEnterPressedOnDateInput) {
            this.isEnterPressedOnDateInput = false;
            return;
        }
        let newVal = $event.target.value.trim();
        newVal = newVal ? getNativeDateObject(newVal, {pattern: isMobile() ? this.outputformat : this.datepattern, meridians: this.meridians}) : undefined;
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
            const action = this.keyEventPlugin.constructor.getEventFullKey(event);
            if (action === 'enter' || action === 'arrowdown') {
                newVal = newVal ? getNativeDateObject(newVal, {pattern: isMobile() ? this.outputformat : this.datepattern, meridians: this.meridians}) : undefined;
                event.preventDefault();
                const formattedDate = getFormattedDate(this.datePipe, newVal, this.dateInputFormat);
                const inputVal = event.target.value.trim();
                if (inputVal && this.datepattern === 'timestamp') {
                    if (!_.isNaN(inputVal) && _.parseInt(inputVal) !== formattedDate) {
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
            const newVal = getNativeDateObject(enteredDate, {pattern: isMobile() ? this.outputformat : this.datepattern, meridians: this.meridians});
            if (!this.formatValidation(newVal, enteredDate)) {
                return;
            }
        }
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (!_.includes(['blur', 'focus', 'change', 'click'], eventName)) {
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
