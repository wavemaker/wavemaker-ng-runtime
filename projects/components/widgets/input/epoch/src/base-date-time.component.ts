import {AfterViewInit, Directive, Inject, Injector, OnDestroy, Optional, ViewChild} from '@angular/core';
import {AbstractControl, Validator} from '@angular/forms';
import {Subscription} from 'rxjs';
import {FormStyle, getLocaleDayPeriods, TranslationWidth} from '@angular/common';
import {BsDropdownDirective} from 'ngx-bootstrap/dropdown';
import {TimepickerComponent, TimepickerConfig} from 'ngx-bootstrap/timepicker';
import {
    AbstractI18nService,
    getDateObj,
    getFormattedDate,
    getNativeDateObject,
    isIos,
    isMobile,
    setAttr
} from '@wm/core';

import {getContainerTargetClass, ToDatePipe} from '@wm/components/base';
import {BaseFormCustomComponent} from '@wm/components/input';
import {BsDatepickerConfig, BsDatepickerDirective} from 'ngx-bootstrap/datepicker';
import {DateTimePickerComponent} from './date-time//date-time-picker.component';
import {filter, forEach, get, includes, isNaN as _isNaN, isString, isUndefined, parseInt, split} from "lodash-es";

declare const $;
import * as momentLib  from 'moment';
const moment = momentLib.default || window['moment'];

const CURRENT_DATE = 'CURRENT_DATE';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DATEPICKER_DROPDOWN_OPTIONS = {
    BUTTON: 'button',
    DEFAULT: 'default'
};
const DATAENTRYMODE_DROPDOWN_OPTIONS = {
    PICKER: 'picker',
    DEFAULT: 'default'
};

// Providing meridians to the timepicker baesd on selected locale
export function getTimepickerConfig(i18nService): TimepickerConfig {
    return Object.assign(new TimepickerConfig(), {
        meridians: getLocaleDayPeriods(i18nService.getSelectedLocale(), FormStyle.Format, TranslationWidth.Abbreviated)
    });
}

@Directive()
export abstract class BaseDateTimeComponent extends BaseFormCustomComponent implements AfterViewInit, OnDestroy, Validator {
    public required: boolean;
    public disabled: boolean;
    public tabindex: any;
    public name: string;
    public autofocus: boolean;
    public readonly: boolean;
    public placeholder: string;
    public shortcutkey: string;
    public _triggeredByUser: boolean;

    public excludedays: string;
    public excludedDaysToDisable: Array<number>;
    public excludedDatesToDisable: Array<Date>;
    public excludedates;
    public outputformat;
    public mindate;
    public maxdate;
    public dataentrymode;
    protected activeDate;
    private elementScope;
    public viewmode;
    public datepattern;
    public timepattern;
    protected showseconds: boolean;
    protected ismeridian: boolean;
    protected meridians: any;
    protected datePipe;
    protected i18nService;
    public isReadOnly = false;
    protected selectedLocale: string;
    public selectfromothermonth: boolean;
    public todaybutton: boolean;
    public clearbutton: boolean;
    public removeKeyupListener;
    public loadNativeDateInput;
    public showcustompicker;
    public next;
    public prev;
    public clicked = false;
    public showampmbuttons=true;
    protected dateNotInRange: boolean;
    protected timeNotInRange: boolean;
    protected invalidDateTimeFormat: boolean;

    private dateOnShowSubscription: Subscription;
    private cancelLocaleChangeSubscription;
    public get timeZone() { return this.inj.get(AbstractI18nService).getTimezone(this); }

    formatsByLocale = {'timezone': ''};

    /**
     * This is an internal property used to map the containerClass, showWeekNumbers etc., to the bsDatepicker
     */
    public _dateOptions: BsDatepickerConfig = new BsDatepickerConfig();
    protected bsDatePickerDirective: BsDatepickerDirective;

    @ViewChild(BsDropdownDirective) protected bsDropdown;
    @ViewChild(TimepickerComponent) protected bsTimePicker;
    @ViewChild(DateTimePickerComponent) datetimepickerComponent;
    private validateType: string;
    containerTarget: string;

    constructor(inj: Injector, WIDGET_CONFIG, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        this.i18nService = this.inj.get(AbstractI18nService);
        this.invokeEventCallback('beforeload');

        this.datePipe = this.inj.get(ToDatePipe);
        this.selectedLocale = this.i18nService.getSelectedLocale();
        this._dateOptions.todayPosition = 'left';
        this._dateOptions.clearPosition = 'right';
        this.meridians = getLocaleDayPeriods(this.selectedLocale, FormStyle.Format, TranslationWidth.Abbreviated);
        this.loadNativeDateInput = isMobile() && !this.showcustompicker;

        this.cancelLocaleChangeSubscription = this.getAppInstance().subscribe("locale-changed", (locale) => {
            this.datePipe.datePipe.locale = locale.angular;
            this._dateOptions.todayButtonLabel = this.i18nService.getLocalizedMessage('LABEL_TODAY_DATE');
            this._dateOptions.clearButtonLabel = this.i18nService.getLocalizedMessage('LABEL_CLEAR_DATE');
        });
    }


    /**
     * returns true if the input value is default (i.e open date picker on input click)
     * @param1 dropdownvalue, user selected value (by default datepicker opens on input click)
     * **/
    protected isDropDownDisplayEnabledOnInput(dropdownvalue) {
        return dropdownvalue === DATEPICKER_DROPDOWN_OPTIONS.DEFAULT;
    }

    /**
     * returns true if the input value is default (i.e Data entry can be done either by selecting from the Date/DateTime/Time Picker or by entering  manually using the keyboard. )
     * @param1 dropdownvalue, user selected value
     * **/
    protected isDataEntryModeEnabledOnInput(dropdownvalue) {
        return dropdownvalue === DATAENTRYMODE_DROPDOWN_OPTIONS.DEFAULT;
    }
    /**
     * This method is used to show validation message depending on the isNativePicker flag.
     */
    private showValidation($event, displayValue, isNativePicker, msg) {
        if (isNativePicker) {
            console.warn('min max date validation failed ', msg);
            return $($event.target).val(displayValue);
        }
    }

    resetDisplayInput() {
        $(this.nativeElement).find('.display-input').val('');
    }

    public validate(c: AbstractControl) {
        if (this.invalidDateTimeFormat) {
            return {
                invalidDateTimeFormat: {
                    valid: false
                }
            };
        }
        if (!isUndefined(this.dateNotInRange) && this.dateNotInRange) {
            return {
                dateNotInRange: {
                    valid: false
                },
            };
        }
        if (!isUndefined(this.timeNotInRange) && this.timeNotInRange) {
            return {
                timeNotInRange: {
                    valid: false
                },
            };
        }
        /* WMS-18269 | Extending the existing validation for 'required' */
        if (this['show'] && this['required']) {
            return !!c.value ? null : { required: true };
        }
        this.validateType = '';
        return null;
    }

    /**
     * This method is used to validate date pattern and time pattern
     * If user selects one pattern in design time and if he tries to enter the date in another pattern then the device is throwing an error
     */
    protected formatValidation(newVal, inputVal, isNativePicker?: boolean) {
        const pattern = this.datepattern || this.timepattern;
        const timeZone = this.timeZone;
        const formattedDate = getFormattedDate(this.datePipe, newVal, pattern, timeZone, null, null, this);
        inputVal = inputVal.trim();
        if (inputVal) {
            if (pattern === 'timestamp') {
                if (!_isNaN(inputVal) && parseInt(inputVal) !== formattedDate) {
                    this.invalidDateTimeFormat = true;
                    this.validateType = 'incorrectformat';
                    this.invokeOnChange(this.datavalue, undefined, false);
                    return false;
                }
            } else {
                if (isNativePicker) {
                    // format the date value only when inputVal is obtained from $event.target.value, as the format doesnt match.
                    inputVal = getFormattedDate(this.datePipe, inputVal, pattern, timeZone);
                }
                if (inputVal !== formattedDate) {
                    this.invalidDateTimeFormat = true;
                    this.validateType = 'incorrectformat';
                    this.invokeOnChange(this.datavalue, undefined, false);
                    return false;
                }
            }

        }
        return true;
    }

    /**
     * This method is used to validate min date, max date, exclude dates and exclude days
     * In mobile if invalid dates are entered, device is showing an alert.
     * In web if invalid dates are entered, device is showing validation message.
     */
    protected minDateMaxDateValidationOnInput(newVal, $event?: Event, displayValue?: string, isNativePicker?: boolean) {
        if (newVal) {
            const dateTimeVal = newVal;
            newVal = moment(newVal).startOf('day').toDate();
            const minDate = moment(getDateObj(this.mindate)).startOf('day').toDate();
            const maxDate = moment(getDateObj(this.maxdate)).startOf('day').toDate();
            if (this.mindate && newVal < minDate) {
                const msg = `${this.appLocale.LABEL_MINDATE_VALIDATION_MESSAGE} ${this.mindate}.`;
                this.invokeOnChange(this.datavalue, undefined, false);
                if (isNativePicker && getFormattedDate(this.datePipe, minDate, this.datepattern, this.timeZone, null, null, this) === displayValue) {
                    return $($event.target).val(displayValue);
                }
                this.dateNotInRange = true;
                this.validateType = 'mindate';
                return this.showValidation($event, displayValue, isNativePicker, msg);
            }
            if (this.maxdate && newVal > maxDate) {
                const msg = `${this.appLocale.LABEL_MAXDATE_VALIDATION_MESSAGE} ${this.maxdate}.`;
                this.invokeOnChange(this.datavalue, undefined, false);
                if (isNativePicker && getFormattedDate(this.datePipe, maxDate, this.datepattern, this.timeZone, null, null, this) === displayValue) {
                    return $($event.target).val(displayValue);
                }
                this.dateNotInRange = true;
                this.validateType = 'maxdate';
                return this.showValidation($event, displayValue, isNativePicker, msg);
            }
            if (this.excludedates) {
                let excludeDatesArray;
                if (isString(this.excludedates)) {
                    excludeDatesArray = split(this.excludedates, ',');
                } else {
                    excludeDatesArray = this.excludedates;
                }
                excludeDatesArray = excludeDatesArray.map(d => getFormattedDate(this.datePipe, d, this.datepattern, this.timeZone, null, null, this));
                if (excludeDatesArray.indexOf(getFormattedDate(this.datePipe, dateTimeVal, this.datepattern, this.timeZone, null, null, this)) > -1) {
                    this.dateNotInRange = true;
                    this.validateType = 'excludedates';
                    this.invokeOnChange(this.datavalue, undefined, false);
                    return;
                }
            }
            if (this.excludedays) {
                const excludeDaysArray = split(this.excludedays, ',');
                const day = get(dateTimeVal, 'getDay') ? dateTimeVal.getDay() : dateTimeVal;
                if (excludeDaysArray.indexOf(day.toString()) > -1) {
                    this.dateNotInRange = true;
                    this.validateType = 'excludedays';
                    this.invokeOnChange(this.datavalue, undefined, false);
                    return;
                }
            }
        }

        if (!isNativePicker) {
            this.dateNotInRange = false;
            this.invokeOnChange(this.datavalue, undefined, false);
        }
    }

    /**
     * This method is used to highlight the current date
     */
    protected hightlightToday(newDate) {
        if(this.datavalue) return;
        const activeMonth = $(`.bs-datepicker-head .current`).first().text();
        const activeYear =  $(".bs-datepicker-head .current").eq(1).text();
        const month = new Date(newDate).toLocaleString('default', { month: 'long' });
        const year = newDate.getFullYear().toString();
        if(activeMonth == month && activeYear == new Date().getFullYear() && newDate.getDate() === new Date().getDate() && newDate.getMonth() === new Date().getMonth() && newDate.getFullYear() === new Date().getFullYear()) {
            const toDay = new Date().getDate().toString();
            filter($(`span:contains(${toDay})`).not('.is-other-month'), (obj) => {
                if ($(obj).text() === toDay) {
                    $(obj).addClass('current-date text-info');
                }
            });
        }
    }

    /**
     * This method is used to find the new date is from another year or not
     * @param newDate - newly selected date value
     */
    private isOtheryear(newDate) {
        return (newDate.getMonth() === 0 && this.activeDate.getMonth() === 11) || (newDate.getMonth() === 11 && this.activeDate.getMonth() === 0);
    }

    public showDatePickerModal(bsDataValue) {
        this.activeDate = bsDataValue || new Date();
        this.setNextData(this.activeDate);
        this.datetimepickerComponent.show();
        setTimeout(() => {
            this.addDatepickerMouseEvents();
            this.setActiveDateFocus(this.activeDate, true);
        }, 500);
        return ;
    }

    /**
     * This method is used to load other month days or other month or other year
     * @param btnClass - class(previous/next) of the button which we have to click
     * @param timePeriod - String value decides to load other month days or other month or other year
     */
    private goToOtherMonthOryear(btnClass, timePeriod) {
        const $node = $(`.bs-datepicker-head .${btnClass}`);
        if ($node.attr('disabled')) {
            return;
        }
        $node.trigger('click');
        if (timePeriod === 'days') {
            this.loadDays();
        } else if (timePeriod === 'month') {
            this.loadMonths();
        } else if (timePeriod === 'year') {
            this.loadYears();
        }
    }

    /**
     * This method is used to set focus for active day
     * @param newDate - newly selected date value
     * @param isMouseEvent - boolean value represents the event is mouse event/ keyboard event
     * @param fromKeyboardEvents
     */
    private setActiveDateFocus(newDate, isMouseEvent?: boolean, fromKeyboardEvents?: boolean) {
        this.setNextData(newDate);
        this.clicked = false;
        const activeMonth = this.activeDate.getMonth();
        // check for keyboard event
        if (!isMouseEvent) {
            if (newDate.getMonth() < activeMonth) {
                this.isOtheryear(newDate) ? this.goToOtherMonthOryear('next', 'days') : this.goToOtherMonthOryear('previous', 'days');
            } else if (newDate.getMonth() > activeMonth) {
                this.isOtheryear(newDate) ? this.goToOtherMonthOryear('previous', 'days') : this.goToOtherMonthOryear('next', 'days');
            }
        }
        setTimeout(() => {
            const newDay = newDate.getDate().toString();
            filter($(`span:contains(${newDay})`).not('.is-other-month'), (obj) => {
                const activeMonth = $(`.bs-datepicker-head .current`).first().text();
                const activeYear =  $(".bs-datepicker-head .current").eq(1).text();
                const monthName = new Date().toLocaleString('default', { month: 'long' });
                if ($(obj).text() === newDay) {
                    if ($(obj).hasClass('selected')) {
                        $(obj).parent().attr('aria-selected', 'true');
                    }
                    $(obj).attr('aria-label', moment(newDate).format('dddd, MMMM Do YYYY'));
                    $('[bsdatepickerdaydecorator]').not('.is-other-month').attr('tabindex', '-1');
                    $(obj).attr('tabindex', '0');
                    $(obj).focus();
                    this.activeDate = newDate;
                }
            });
            if (newDate.getDate() === new Date().getDate() && newDate.getMonth() === new Date().getMonth() && newDate.getFullYear() === new Date().getFullYear()) {
                this.hightlightToday(newDate);
            }
        });

    }

    private getMonth(date, inc) {
        const currentMonth = new Date(date);

        let month = currentMonth.getMonth();
        const year = currentMonth.getFullYear();

        month += inc;

        const newDate = new Date(year, month);

        const fullMonth = newDate.toLocaleString('en-US', { month: 'long' });

        return {
            date: newDate,
            fullMonth: fullMonth
        };
    }

    /**
     * This method sets focus for months/days depending on the loaded datepicker table
     */
    private setFocusForMonthOrDay() {
        const activeMonthOrYear = $(`.bs-datepicker-head .current`).first().text();
        const datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.find('table.months').length > 0) {
            if (parseInt(activeMonthOrYear) !== this.activeDate.getFullYear()) {
                this.loadMonths();
            }
            const newDate = new Date(parseInt(activeMonthOrYear), this.activeDate.getMonth(), this.activeDate.getDate());
            this.setActiveMonthFocus(newDate, true);
        } else if (datePickerBody.find('table.days').length > 0) {
            const newMonth = months.indexOf(activeMonthOrYear);
            if (newMonth !== this.activeDate.getMonth()) {
                this.loadDays();
            }
            const newDate = new Date(this.activeDate.getFullYear(), newMonth, 1);
            this.setActiveDateFocus(newDate, true);
        }
    }

    /**
     * This method sets focus for months/years depending on the loaded datepicker table
     */
    private setFocusForCurrentMonthOryear() {
        const datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.find('table.months').length > 0) {
            this.loadMonths();
            this.setActiveMonthFocus(this.activeDate, true);
        } else if (datePickerBody.find('table.years').length > 0) {
            this.loadYears();
            this.setActiveYearFocus(this.activeDate, true);
        }
    }

    /**
     * This method sets focus for months/years/days depending on the loaded datepicker table
     */
    private setFocusForDate(count) {
        const datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.find('table.months').length > 0) {
            this.loadMonths();
            const newDate = new Date(this.activeDate.getFullYear() + count, 0, this.activeDate.getDate());
            this.setActiveMonthFocus(newDate, true);
        } else if (datePickerBody.find('table.years').length > 0) {
            this.loadYears();
            const startYear = datePickerBody.find('table.years span').first().text();
            const newDate = new Date(parseInt(startYear), this.activeDate.getMonth(), this.activeDate.getDate());
            this.setActiveYearFocus(newDate, true);
        } else if (datePickerBody.find('table.days').length > 0) {
            this.loadDays();
            const [monthText, yearText] = $('.bs-datepicker-head .current').map((_, el) => $(el).text().trim()).get();
            const monthIndex = new Date(`${monthText} 1, ${yearText}`).getMonth();
            const year = parseInt(yearText, 10);
            const inMonth = (d: Date) => d.getFullYear() === year && d.getMonth() === monthIndex;
            let newDate = this.mindate && inMonth(new Date(this.mindate)) ? new Date(this.mindate) : this.maxdate && inMonth(new Date(this.maxdate)) ? new Date(this.maxdate) : new Date(year, monthIndex, 1);
            this.setActiveDateFocus(newDate, true);
        }
    }

    /**
     * This method is used to add keyboard events while opening the date picker
     * @param scope - scope of the date/datetime widget
     * @param isDateTime - boolean value represents the loaded widget is date or datetime
     */
    protected addDatepickerKeyboardEvents(scope, isDateTime) {
        this.elementScope = scope;
        const dateContainer = document.querySelector(`.${scope.dateContainerCls}`) as HTMLElement;
        setAttr(dateContainer, 'tabindex', '0');
        dateContainer.onkeydown = (event) => {
            // Check for Shift+Tab key or Tab key or escape
            if (event.key === 'Escape') {
                this.elementScope.hideDatepickerDropdown();
                const displayInputElem = this.elementScope.nativeElement.querySelector('.display-input') as HTMLElement;
                setTimeout(() => displayInputElem.focus());
            }
        };
        this.loadDays();
        this.setActiveDateFocus(this.activeDate, undefined, true);
    }
    private setNextData(nextDate) {
        this.next = this.getMonth(nextDate, 1);
        this.prev = this.getMonth(nextDate, -1);
    }
    /**
     * This method is used to add tabindex, keybord and mouse events for days
     */
    private loadDays() {
        setTimeout(() => {
            $('[bsdatepickerdaydecorator]').not('.is-other-month').attr('tabindex', '0');
            // if (this.clicked === false) {
            //     this.next = this.getMonth(this.activeDate, 1);
            //     this.prev = this.getMonth(this.activeDate, -1);
            // }
            this.addKeyBoardEventsForDays();
            this.addDatepickerMouseEvents();
        });
    }

    /**
     * This method sets keyboard events for days
     */
    private addKeyBoardEventsForDays() {
        const datePickerBody = $('.bs-datepicker-body');
        datePickerBody.keydown((event) => {
            let newdate;
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(+7, 'days').toDate();
                this.setActiveDateFocus(newdate);
            } else if (event.ctrlKey && event.key === 'ArrowUp') {
                // clicking on table header month name to load list of months
                $('.bs-datepicker-head .current').first().click();
                this.loadMonths();
                this.setActiveMonthFocus(this.activeDate);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(-7, 'days').toDate();
                this.setActiveDateFocus(newdate);
            } else if (event.key === 'ArrowLeft') {
                newdate = moment(this.activeDate).add(-1, 'days').toDate();
                this.setActiveDateFocus(newdate);
            } else if (event.key === 'ArrowRight') {
                newdate = moment(this.activeDate).add(+1, 'days').toDate();
                this.setActiveDateFocus(newdate);
            } else if (event.key === 'PageUp') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(-1, 'month').toDate();
                this.setActiveDateFocus(newdate);
            } else if (event.key === 'PageDown') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(+1, 'month').toDate();
                this.setActiveDateFocus(newdate);
            } else if (event.key === 'Enter') {
                if ($(document.activeElement).hasClass('disabled')) {
                    return;
                }
                $(document.activeElement).click();
                this.elementScope.hideDatepickerDropdown();
                const displayInputElem = this.elementScope.nativeElement.querySelector('.display-input') as HTMLElement;
                setTimeout(() => displayInputElem.focus());
            }
        });
        this.focusBlurDatePickerHeadButtons();
    }

    private focusBlurDatePickerHeadButtons() {
        const datePickerHeadButton = $('.bs-datepicker-head button');
        datePickerHeadButton.on('focus', function() { $(this).css('background-color', '#9AA0A3'); });
        datePickerHeadButton.on('blur', function() { $(this).css('background-color', ''); });
    }

    /**
     * This method is used to add tabindex, keybord and mouse events for months
     */
    private loadMonths() {
        setTimeout(() => {
            this.addKeyBoardEventsForMonths();
            this.addDatepickerMouseEvents();
        });
    }

    /**
     * This method sets keyboard events for months
     */
    private addKeyBoardEventsForMonths() {
        $('.bs-datepicker-body').keydown((event) => {
            let newdate;
            if ((event.ctrlKey && event.key === 'ArrowDown') || event.key === 'Enter') {
                if ($(document.activeElement).parent().hasClass('disabled')) {
                    return;
                }
                $(document.activeElement).click();
                this.loadDays();
                const newDate = new Date(this.activeDate.getFullYear(), this.activeDate.getMonth(), 1);
                this.setActiveDateFocus(newDate);
            } else if (event.ctrlKey && event.key === 'ArrowUp') {
                // clicking on table header year to load list of years
                $('.bs-datepicker-head .current').first().click();
                this.loadYears();
                this.setActiveYearFocus(this.activeDate);
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(+3, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(-3, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            } else if (event.key === 'ArrowLeft') {
                newdate = moment(this.activeDate).add(-1, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            } else if (event.key === 'ArrowRight') {
                newdate = moment(this.activeDate).add(+1, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            }
        });
        this.focusBlurDatePickerHeadButtons();
    }

    /**
     * This method is used to add tabindex, keybord and mouse events for years
     */
    private loadYears() {
        setTimeout(() => {
            this.addKeyBoardEventsForYears();
            this.addDatepickerMouseEvents();
        });
    }

    /**
     * This method is used to set focus for active month
     */
    private setActiveMonthFocus(newDate, isMoouseEvent?: boolean) {
        this.setNextData(newDate);
        const newMonth = months[newDate.getMonth()];
        // check for keyboard event
        if (!isMoouseEvent) {
            if (newDate.getFullYear() < this.activeDate.getFullYear()) {
                this.goToOtherMonthOryear('previous', 'month');
            } else if (newDate.getFullYear() > this.activeDate.getFullYear()) {
                this.goToOtherMonthOryear('next', 'month');
            }
        }
        setTimeout(() => {
            $(`.bs-datepicker-body table.months span`).attr('tabindex', '-1');
            $(`.bs-datepicker-body table.months span:contains(${newMonth})`).attr('tabindex', '0');
            $(`.bs-datepicker-body table.months span:contains(${newMonth})`).focus();
            this.activeDate = newDate;
        });
    }

    /**
     * This method sets keyboard events for years
     */
    private addKeyBoardEventsForYears() {
        $('.bs-datepicker-body').keydown((event) => {
            let newdate;
            if ((event.ctrlKey && event.key === 'ArrowDown') || event.key === 'Enter') {
                if ($(document.activeElement).parent().hasClass('disabled')) {
                    return;
                }
                $(document.activeElement).click();
                this.loadMonths();
                this.setActiveMonthFocus(this.activeDate);
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(+4, 'year').toDate();
                this.setActiveYearFocus(newdate);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(-4, 'year').toDate();
                this.setActiveYearFocus(newdate);
            } else if (event.key === 'ArrowLeft') {
                newdate = moment(this.activeDate).add(-1, 'year').toDate();
                this.setActiveYearFocus(newdate);
            } else if (event.key === 'ArrowRight') {
                newdate = moment(this.activeDate).add(+1, 'year').toDate();
                this.setActiveYearFocus(newdate);
            }
        });
        this.focusBlurDatePickerHeadButtons();
    }

    /**
     * This method is used to set focus for active year
     */
    private setActiveYearFocus(newDate, isMouseEvent?: boolean) {
        const newYear = newDate.getFullYear();
        const datePickerYears = $('.bs-datepicker-body table.years span');
        const startYear = datePickerYears.first().text();
        const endYear = datePickerYears.last().text();
        // check for keyboard event
        if (!isMouseEvent) {
            if (newDate.getFullYear() < parseInt(startYear)) {
                this.goToOtherMonthOryear('previous', 'year');
            } else if (newDate.getFullYear() > parseInt(endYear)) {
                this.goToOtherMonthOryear('next', 'year');
            }
        }
        setTimeout(() => {
            $(`.bs-datepicker-body table.years span`).attr('tabindex', '-1');
            $(`.bs-datepicker-body table.years span:contains(${newYear})`).attr('tabindex', '0');
            $(`.bs-datepicker-body table.years span:contains(${newYear})`).focus();
            this.activeDate = newDate;
        });
    }

    /**
     * This method sets focus for timepicker first input field(hours field) while opening time picker
     * @param scope - scope of the time picker widget
     */
    protected focusTimePickerPopover(scope) {
        this.elementScope = scope;
        // setTimeout is used so that by then time input has the updated value. focus is setting back to the input field
        this.elementScope.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                $('timepicker .form-group').first().find('> input.form-control').focus();
            });
        });


    }
    /**
     * This function sets the keyboard events to Timepicker popup
     */
    protected bindTimePickerKeyboardEvents() {
        setTimeout(() => {
            const $timepickerPopup = $('body').find('> bs-dropdown-container timepicker');
            $timepickerPopup.attr('tabindex', 0);
            this.addEventsOnTimePicker($timepickerPopup);
        });
    }

    protected focusOnInputEl() {
        if ($(this.nativeElement).closest('.caption-floating').length > 0) {
            setTimeout(() => {
                $(this.nativeElement).find('.app-textbox').focus();
            }, 100);
        }
    }

    /**
     * This function checks whether the given date is valid or not
     * @returns boolean value, true if date is valid else returns false
     */
    private isValidDate(date) {
        return date && date instanceof Date && !isNaN(date.getTime());
    }

    /**
     * This function checks whether the given time is valid or not
     */
    private timeFormatValidation() {
        const enteredDate = $(this.nativeElement).find('input').val();
        const newVal = getNativeDateObject(enteredDate, {meridians: this.meridians, pattern: this.datepattern});
        if (!this.formatValidation(newVal, enteredDate)) {
            return;
        }
        this.invalidDateTimeFormat = false;
        this.invokeOnChange(this.datavalue, undefined, false);
    }

    private updateTimeValue(el, value, fieldName) {
        let minEl = el.find('input[aria-label="minutes"]');
        let secEl = el.find('input[aria-label="seconds"]');
        minEl.value = secEl.value = '00';
        if (value.length < 2) {
            setTimeout(() => {
                fieldName === 'minutes' ? this.bsTimePicker.updateMinutes(minEl) : this.bsTimePicker.updateSeconds(secEl);
            }, 500);
        } else {
            fieldName === 'minutes' ? this.bsTimePicker.updateMinutes(minEl) : this.bsTimePicker.updateSeconds(secEl);
        }
    }

    /**
     * This function sets the events to given element
     * @param $el - element on which the event is added
     */
    private addEventsOnTimePicker($el: JQuery) {
        const inputFields = $el.find('.bs-timepicker-field');
        // WMS-19382: update minutes and seconds to 0 when we enter hour value
        inputFields.first().on('keyup', evt => {
            const hourValue = (evt.target as any).value;
            forEach(inputFields, (field, index) => {
                // @ts-ignore
                if (evt.target !== field && field.value === '' && hourValue.length) {
                    const fieldName = index === 1 ? 'minutes' : 'seconds';
                    this.updateTimeValue($el, hourValue, fieldName);
                }
            });
        });
        this.removeKeyupListener = () => {
            inputFields.first().off('keyup');
        };
        $el.on('keydown', event => {
            const $target = $(event.target);
            const $parent = $target.parent();
            const elementScope = this.elementScope;

            let stopPropogation, preventDefault;

            if (event.key === 'Escape') {
                elementScope.hideTimepickerDropdown();
            }

            if ($target.hasClass('bs-timepicker-field')) {
                if ($parent.is(':first-child')) {
                    if ((event.shiftKey && event.key === 'Tab') || event.key === 'Enter' || event.key === 'Escape') {
                        elementScope.setIsTimeOpen(false);
                        this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                } else if ($parent.is(':last-child') || ($parent.next().next().find('button.disabled').length)) {
                    if (event.key === 'Tab' || event.key === 'Escape' || event.key === 'Enter') {
                        elementScope.setIsTimeOpen(false);
                        this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                } else {
                    if (event.key === 'Enter' || event.key === 'Escape') {
                        elementScope.setIsTimeOpen(false);
                        this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                }
                if (stopPropogation) {
                    event.stopPropagation();
                }
                if (preventDefault) {
                    event.preventDefault();
                }
                if (elementScope.mintime && elementScope.maxtime && !this.isValidDate(elementScope.bsTimeValue)) {
                    if (event.key === 'ArrowDown') {
                        elementScope.bsTimeValue = elementScope.maxTime;
                    } else if (event.key === 'ArrowUp') {
                        elementScope.bsTimeValue = elementScope.minTime;
                    }
                }
                if (event.key === 'Tab') {
                    this.invalidDateTimeFormat = false;
                    this.invokeOnChange(this.datavalue, undefined, false);
                    const pattern = this.datepattern || this.timepattern;
                    if (getFormattedDate(elementScope.datePipe, elementScope.bsTimeValue, pattern, this.timeZone, null, null, this) === elementScope.displayValue) {
                        $(this.nativeElement).find('.display-input').val(elementScope.displayValue);
                    }
                }
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    this.timeFormatValidation();
                }
            } else if ($target.hasClass('btn-default')) {
                if (event.key === 'Tab' || event.key === 'Escape') {
                    elementScope.setIsTimeOpen(false);
                    this.focus();
                }
            }
        });
        $el.find('a').on('click', evt => {
            const elementScope = this.elementScope;
            const $target = $(evt.target);
            if (elementScope.mintime && elementScope.maxtime && !this.isValidDate(elementScope.bsTimeValue)) {
                if ($target.find('span').hasClass('bs-chevron-down')) {
                    elementScope.bsTimeValue = elementScope.maxTime;
                } else if ($target.find('span').hasClass('bs-chevron-up')) {
                    elementScope.bsTimeValue = elementScope.minTime;
                }
            }
            this.timeFormatValidation();
        });
    }

    public updateFormat(pattern) {
        if (pattern === 'datepattern') {
            this._dateOptions.dateInputFormat = this.datepattern;
            this.showseconds = includes(this.datepattern, 's');
            this.ismeridian = includes(this.datepattern, 'h');
        } else if (pattern === 'timepattern') {
            this.showseconds = includes(this.timepattern, 's');
            this.ismeridian = includes(this.timepattern, 'h');
        }
    }

    getMobileInput() {
        return this.nativeElement.querySelector('.mobile-input') as HTMLElement;
    }

    onDateTimeInputBlur() {
        // removing the opacity on blur of the mobile widget
        const displayInputElem = this.getMobileInput();
        if (displayInputElem) {
            const children = this.nativeElement.children;
            for (let i = 0; i < children.length; i++) {
                children[i].classList.remove('add-opacity');
            }
            displayInputElem.classList.remove('remove-opacity');
        }
    }

    onDateTimeInputFocus(skipFocus: boolean = false): void {
        if (!this.loadNativeDateInput) {
            return;
        }
        const displayInputElem = this.getMobileInput();
        // toggling the classes to show and hide the native widget using opacity
        if (skipFocus) {
            const children = this.nativeElement.children;
            for (let i = 0; i < children.length; i++) {
                children[i].classList.add('add-opacity');
            }
            displayInputElem.classList.add('remove-opacity');
            return;
        }

        if (displayInputElem && this._triggeredByUser) {
            displayInputElem.focus();
            displayInputElem.click();
        }
    }

    /**
     * This method sets the mouse events to Datepicker popup. These events are required when we navigate date picker through mouse.
     */
    private addDatepickerMouseEvents() {
        $(".bs-datepicker-head .previous span").attr("aria-hidden", 'true');
        $(".bs-datepicker-head .next span").attr("aria-hidden", 'true');

        $(".bs-datepicker-head").on("click", ".previous", (event) => {
            this.next = this.getMonth(this.activeDate, 0);
            this.prev = this.getMonth(this.activeDate, -2);
            this.clicked = true;
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForDate(-1);
            }
            var prevMon = this.getMonth(this.activeDate, -1);
            const current = new Date();
            if(prevMon.date.getMonth()===current.getMonth() && prevMon.date.getFullYear()===current.getFullYear()) {
                this.hightlightToday(new Date());
            }
            setTimeout(() => {
                $(".bs-datepicker-head .previous span").attr("aria-hidden", 'true');
                $(".bs-datepicker-head .next span").attr("aria-hidden", 'true');
                $(".bs-datepicker-head .next").attr('aria-label', `Next Month, ${this.next.fullMonth} ${this.next.date.getFullYear()}`);
                $(".bs-datepicker-head .previous").attr('aria-label', `Previous Month, ${this.prev.fullMonth} ${this.prev.date.getFullYear()}`);
                $('.bs-datepicker-head .current').first().append(`<h2 aria-hidden="false" aria-atomic="true" aria-live='polite' class="sr-only">Changed to Previous Month, ${prevMon.fullMonth} and year ${prevMon.date.getFullYear()}</h2>`);
                $('.bs-datepicker-head').on('focus', '.current', function () {
                    $('.bs-datepicker-head .current').find('h2').remove();
                })
                $(`.bs-datepicker-head .previous`).focus();

            });

        });
        $(".bs-datepicker-head").on("click", ".next", (event) => {
            this.next = this.getMonth(this.activeDate, 2);
            this.prev = this.getMonth(this.activeDate, 0);
            this.clicked = true;
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForDate(1);
            }
            var nextMon = this.getMonth(this.activeDate, 1);
            const current = new Date();
            if (nextMon.date.getMonth() === current.getMonth() && nextMon.date.getFullYear() === current.getFullYear()) {
                this.hightlightToday(current);
            }
            setTimeout(() => {
                $(".bs-datepicker-head .previous span").attr("aria-hidden", 'true');
                $(".bs-datepicker-head .next span").attr("aria-hidden", 'true');
                $(".bs-datepicker-head .next").attr('aria-label', `Next Month, ${this.next.fullMonth} ${this.next.date.getFullYear()}`);
                $(".bs-datepicker-head .previous").attr('aria-label', `Previous Month, ${this.prev.fullMonth} ${this.prev.date.getFullYear()}`);
                $('.bs-datepicker-head .current').first().append(`<h2 aria-hidden="false" aria-atomic="true" aria-live='polite' class="sr-only">Changed to Next Month, ${nextMon.fullMonth} and year ${nextMon.date.getFullYear()}</h2>`);
                $('.bs-datepicker-head').on('focus', '.current', function () {
                    $('.bs-datepicker-head .current').find('h2').remove();
                })
                $(`.bs-datepicker-head .next`).focus();
            });

        });
        $(".bs-datepicker-head").on("click", ".current", (event) => {
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForCurrentMonthOryear();
            }
        });
        $('.bs-datepicker-body').on("click", ".bs-datepicker-action-buttons", (event) => {
            event.stopPropagation();
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForMonthOrDay();
            }
        });
        // if(!this.clicked) {
        $(".bs-datepicker-head .next").attr('aria-label', `Next Month, ${this.next.fullMonth} ${this.next.date.getFullYear()}`);
        $(".bs-datepicker-head .previous").attr('aria-label', `Previous Month, ${this.prev.fullMonth} ${this.prev.date.getFullYear()}`);
        //  }
    }

    blurDateInput(isPickerOpen) {
        const displayInputElem = this.nativeElement.querySelector('.display-input') as HTMLElement;
        if (isPickerOpen) {
            setTimeout(() => displayInputElem.blur());
        }
    }

    getPeriod(): 'AM' | 'PM' {
        if (!this.elementScope.bsTimeValue) return 'AM';
        const hours =this.elementScope.bsTimeValue.getHours();
        return hours >= 12 ? 'PM' : 'AM';
    }

    setPeriod(period: 'AM' | 'PM'): void {
        const current = this.elementScope.bsTimeValue;
        if (!current || !(current instanceof Date)) return;
        const updatedDate = new Date(current);
        const hours = updatedDate.getHours();
        if (period === 'AM' && hours >= 12) {
            updatedDate.setHours(hours - 12);
        } else if (period === 'PM' && hours < 12) {
            updatedDate.setHours(hours + 12);
        }
        if(this.elementScope.widgetType==='wm-time'){
           const isInvalid= this.elementScope.minTime && this.elementScope.maxTime && (updatedDate < this.elementScope.minTime || updatedDate > this.elementScope.maxTime);
           if(!isInvalid)
            this.elementScope.onTimeChange(updatedDate);
        }
        else{
            this.elementScope.onModelUpdate(updatedDate);
        }
    }

    onPropertyChange(key, nv, ov?) {

        if (key === 'tabindex') {
            return;
        }
        if(key === 'showampmbuttons') {
            this.showampmbuttons=nv;
        }
        if (key === 'required') {
            this._onChange(this.datavalue);
            return;
        }
        if (key === 'datepattern') {
            this.updateFormat(key);
        } else if(key === 'viewmode') {
            this._dateOptions.minMode = this.viewmode;
        } else if (key === 'showweeks') {
            this._dateOptions.showWeekNumbers = nv;
        } else if (key === 'mindate') {
            this._dateOptions.minDate = (nv === CURRENT_DATE) ? this.mindate = new Date() : getDateObj(nv);
            this.minDateMaxDateValidationOnInput(this.datavalue);
        } else if (key === 'maxdate') {
            this._dateOptions.maxDate = (nv === CURRENT_DATE) ? this.maxdate = new Date() : getDateObj(nv);
            this.minDateMaxDateValidationOnInput(this.datavalue);
        } else if (key === 'excludedates' || key === 'excludedays') {
            if (this.excludedays) {
                this.excludedDaysToDisable = split(this.excludedays, ',').map((day) => {
                    return +day;
                });
            }
            if (this.excludedates) {
                this.excludedDatesToDisable = this.excludedates;
                if (isString(this.excludedates)) {
                    // @ts-ignore
                    this.excludedDatesToDisable = split(this.excludedates, ',');
                }
                this.excludedDatesToDisable = this.excludedDatesToDisable.map(d => getDateObj(d));
            }
            this.minDateMaxDateValidationOnInput(this.datavalue);
        } else if (key === 'selectfromothermonth') {
            this._dateOptions.selectFromOtherMonth = nv;

        } else if (key === 'todaybutton') {
            this._dateOptions.showTodayButton = nv;
        } else if (key === 'clearbutton') {
            this._dateOptions.showClearButton = nv;
        } else if (key === 'todaybuttonlabel') {
            this._dateOptions.todayButtonLabel = this.i18nService.getLocalizedMessage(nv) || nv;
        } else if (key === 'clearbuttonlabel') {
            this._dateOptions.clearButtonLabel = this.i18nService.getLocalizedMessage(nv) || nv;
        } else if (key === 'showcustompicker') {
            this.loadNativeDateInput = isMobile() && !this.showcustompicker;
        } else if (key === 'adaptiveposition') {
            this._dateOptions.adaptivePosition = nv;
        } else {
            super.onPropertyChange(key, nv, ov);
        }

    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.containerTarget = getContainerTargetClass(this.nativeElement);
        this.isReadOnly = this.dataentrymode != 'undefined' && !this.isDataEntryModeEnabledOnInput(this.dataentrymode);

        // this mobileinput width varies in ios hence setting width here.
        const mobileInput = this.getMobileInput();
        if (mobileInput) {
            setTimeout(() => {
                mobileInput.style.width = '100%';
                mobileInput.style.height = '100%';
            });
        }
    }

    ngOnDestroy() {
        if (this.dateOnShowSubscription) {
            this.dateOnShowSubscription.unsubscribe();
        }
        if(this.cancelLocaleChangeSubscription) {
            this.cancelLocaleChangeSubscription();
        }

        super.ngOnDestroy();
    }

    public ngOnDetach() {
        this.datetimepickerComponent?.hideModal();
    }

    setTimezone(locale) {
        this.i18nService.setTimezone(locale, this);
    }
    ngOnInit() {
        super.ngOnInit();
        if (this.dateNotInRange||this.timeNotInRange||this.invalidDateTimeFormat) {
            const formattedDisplay = getFormattedDate(this.datePipe, this.datavalue, this.datepattern||this.timepattern, this.timeZone, null, null, this);
            const value=this.datavalue;
            this.datavalue = undefined;
            setTimeout(() => {
                $(this.nativeElement).find('.display-input').val(formattedDisplay);
                this.minDateMaxDateValidationOnInput(formattedDisplay);
                this.invokeOnChange(value, {}, false);
            });
        }
    }
}
