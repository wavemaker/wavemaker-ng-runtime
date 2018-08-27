import { AfterViewInit, OnDestroy } from '@angular/core';
import { Validator } from '@angular/forms';
import { getDateObj, isString, setAttr } from '@wm/core';
import { BaseFormCustomComponent } from './base-form-custom.component';
import { Subscription } from 'rxjs';
import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap';

declare const moment, _, $;
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export abstract class BaseDateTimeComponent extends BaseFormCustomComponent implements AfterViewInit, OnDestroy, Validator {
    public excludedays: string;
    public excludedates;
    public outputformat;
    public mindate;
    public maxdate;
    protected activeDate;
    private keyEventPluginInstance;
    private elementScope;
    protected datepattern: string;
    protected timepattern: string;
    protected showseconds: boolean;
    protected ismeridian: boolean;

    protected dateNotInRange: boolean;

    private dateOnShowSubscription: Subscription;

    /**
     * This is an internal property used to map the containerClass, showWeekNumbers etc., to the bsDatepicker
     */
    protected _dateOptions: BsDatepickerConfig = new BsDatepickerConfig();
    protected bsDatePickerDirective: BsDatepickerDirective;

    /**
     * This method is used to show validation message depending on the isNativePicker flag.
     */
    private showValidation($event, displayValue, isNativePicker, msg) {
        if (isNativePicker) {
            alert(msg);
            return $($event.target).val(displayValue);
        }
    }

    public validate() {
        return (!this.dateNotInRange) ? null : {
            dateNotInRange: {
                valid: false
            },
        };
    }

    /**
     * This method is used to validate min date and max date
     * In mobile if invalid dates are entered, device is showing an alert.
     * In web if invalid dates are entered, device is showing validation message.
     */
    protected minDateMaxDateValidationOnInput(newVal, $event?: Event, displayValue?: string, isNativePicker?: boolean) {
        const dateFormat = 'YYYY-MM-DD';
        if (newVal) {
            newVal = moment(newVal).startOf('day').toDate();
            if (this.mindate && newVal < moment(this.mindate, dateFormat).toDate()) {
                const msg = `${this.appLocale.LABEL_MINDATE_VALIDATION_MESSAGE} ${this.mindate}.`;
                this.dateNotInRange = true;
                return this.showValidation($event, displayValue, isNativePicker, msg);
            }
            if (this.maxdate && newVal > moment(this.maxdate, dateFormat).toDate()) {
                const msg = `${this.appLocale.LABEL_MAXDATE_VALIDATION_MESSAGE} ${this.maxdate}.`;
                this.dateNotInRange = true;
                return this.showValidation($event, displayValue, isNativePicker, msg);
            }
        }

        if (!isNativePicker) {
            this.dateNotInRange = false;
        }
    }

    /**
     * This method is used to highlight the current date
     */
    protected hightlightToday() {
        const toDay = new Date().getDate().toString();
        _.filter($(`span:contains(${toDay})`).not('.is-other-month'), (obj) => {
            if ($(obj).text() === toDay) {
                $(obj).addClass('current-date text-info');
            }
        });
    }

    /**
     * This method is used to find the new date is from another year or not
     * @param newDate - newly selected date value
     */
    private isOtheryear(newDate) {
        return (newDate.getMonth() === 0 && this.activeDate.getMonth() === 11) || (newDate.getMonth() === 11 && this.activeDate.getMonth() === 0);
    }

    /**
     * This method is used to set focus for active day
     * @param newDate - newly selected date value
     * @param isMouseEvent - boolean value represents the event is mouse event/ keyboard event
     */
    private setActiveDateFocus(newDate, isMouseEvent?: boolean) {
        const activeMonth = this.activeDate.getMonth();
        // check for keyboard event
         if (!isMouseEvent) {
            if (newDate.getMonth() < activeMonth) {
                this.isOtheryear(newDate) ?  this.goToOtherMonthOryear('next', 'days') :  this.goToOtherMonthOryear('previous', 'days');
            } else if (newDate.getMonth() > activeMonth) {
                this.isOtheryear(newDate) ? this.goToOtherMonthOryear('previous', 'days') : this.goToOtherMonthOryear('next', 'days');
            }
         }
        setTimeout( () => {
            if (newDate.getMonth() === new Date().getMonth() && newDate.getFullYear() === new Date().getFullYear()) {
                this.hightlightToday();
            }
            const newDay = newDate.getDate().toString();
            _.filter($(`span:contains(${newDay})`).not('.is-other-month'), (obj) => {
                if ($(obj).text() === newDay) {
                    $(obj).focus();
                    this.activeDate = newDate;
                }
            });
        });

    }

    /**
     * This method is used to load other month days or other month or other year
     * @param btnClass - class(previous/next) of the button which we have to click
     * @param timePeriod - String value decides to load other month days or other month or other year
     */
    private goToOtherMonthOryear(btnClass, timePeriod) {
        $(`.bs-datepicker-head .${btnClass}`).trigger( 'click' );
        if (timePeriod === 'days') {
            this.loadDays();
        } else if (timePeriod === 'month') {
            this.loadMonths();
        } else if (timePeriod === 'year') {
            this.loadYears();
        }
    }

    /**
    * This method sets the mouse events to Datepicker popup. These events are required when we navigate date picker through mouse.
     */
    private addDatepickerMouseEvents() {
        const datePikcerHead = $(`.bs-datepicker-head`);
        datePikcerHead.find(`.previous`).click((event) => {
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForDate(-1);
            }
        });
        datePikcerHead.find(`.next`).click((event) => {
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForDate(1);
            }
        });
        datePikcerHead.find(`.current`).click((event) => {
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForCurrentMonthOryear();
            }
        });
        $('.bs-datepicker-body').click((event) => {
            event.stopPropagation();
            // check for original mouse click
            if (event.originalEvent) {
                this.setFocusForMonthOrDay();
            }
        });
    }

    /**
     * This method sets focus for months/days depending on the loaded datepicker table
     */
    private setFocusForMonthOrDay() {
        const activeMonthOrYear = $(`.bs-datepicker-head .current`).first().text();
        const datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.find('table.months').length > 0) {
            this.loadMonths();
            const newDate = new Date(_.parseInt(activeMonthOrYear), this.activeDate.getMonth(), this.activeDate.getDate());
            this.setActiveMonthFocus(newDate, true);
        } else if (datePickerBody.find('table.days').length > 0) {
            this.loadDays();
            const newMonth = months.indexOf(activeMonthOrYear);
            const newDate = new Date(this.activeDate.getFullYear(), newMonth, this.activeDate.getDate());
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
            const newDate = new Date(_.parseInt(startYear), this.activeDate.getMonth(), this.activeDate.getDate());
            this.setActiveYearFocus(newDate, true);
        } else if (datePickerBody.find('table.days').length > 0) {
            this.loadDays();
            const newDate = new Date(this.activeDate.getFullYear(), this.activeDate.getMonth() + count, 1);
            this.setActiveDateFocus(newDate, true);
        }
    }

    /**
     * This method is used to add keyboard events while opening the date picker
     * @param scope - scope of the date/datetime widget
     * @param isDateTime - boolean value represents the loaded widget is date or datetime
     */
    protected addDatepickerKeyboardEvents(scope, isDateTime) {
        this.keyEventPluginInstance = scope.keyEventPlugin;
        this.elementScope = scope;
        const dateContainer  = document.querySelector(`.${scope.dateContainerCls}`) as HTMLElement;
        setAttr(dateContainer, 'tabindex', '0');
        dateContainer.onkeydown = (event) => {
            const action = this.keyEventPluginInstance.getEventFullKey(event);
            // Check for Shift+Tab key or Tab key or escape
            if (action === 'shift.tab' || action === 'escape' || (action === 'tab' && !isDateTime)) {
                this.elementScope.hideDatepickerDropdown();
            }
            if (action === 'tab' && isDateTime) {
                this.bsDatePickerDirective.hide();
                this.elementScope.toggleTimePicker(true);
            }
        };
        this.loadDays();
        this.setActiveDateFocus(this.activeDate);
    }

    /**
     * This method is used to add tabindex, keybord and mouse events for days
     */
    private loadDays() {
        setTimeout(() => {
            $('.bs-datepicker-body').attr('tabindex', '0');
            $('[bsdatepickerdaydecorator]').not('.is-other-month').attr('tabindex', '0');
            this.addKeyBoardEventsForDays();
            this.addDatepickerMouseEvents();
        });
    }

    /**
     * This method sets keyboard events for days
     */
    private addKeyBoardEventsForDays() {
        const datePickerBody = $('.bs-datepicker-body');
        if (datePickerBody.length > 0) {
            datePickerBody[0].addEventListener('mouseenter', (event) => {
                event.stopPropagation();
            }, true);
        }
        datePickerBody.keydown((event) => {
            const action = this.keyEventPluginInstance.getEventFullKey(event);
            let newdate;
            if (action === 'arrowdown') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(+7, 'days').toDate();
                this.setActiveDateFocus(newdate);
            } else if (action === 'arrowup') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(-7, 'days').toDate();
                this.setActiveDateFocus(newdate);
            } else if (action === 'arrowleft') {
                newdate = moment(this.activeDate).add(-1, 'days').toDate();
                this.setActiveDateFocus(newdate);
            } else if (action === 'arrowright') {
                newdate = moment(this.activeDate).add(+1, 'days').toDate();
                this.setActiveDateFocus(newdate);
            } else if (action === 'control.arrowup') {
                // clicking on table header month name to load list of months
                $('.bs-datepicker-head .current').first().click();
                this.loadMonths();
                this.setActiveMonthFocus(this.activeDate);
            } else if (action === 'enter') {
                $(document.activeElement).click();
                this.elementScope.hideDatepickerDropdown();
            }
        });
    }

    /**
     * This method is used to add tabindex, keybord and mouse events for months
     */
    private loadMonths() {
        setTimeout(() => {
            const datePickerBody = $('.bs-datepicker-body');
            datePickerBody.attr('tabindex', '0');
            datePickerBody.find('table.months span').attr('tabindex', '0');
            this.addKeyBoardEventsForMonths();
            this.addDatepickerMouseEvents();
        });
    }

    /**
     * This method sets keyboard events for months
     */
    private addKeyBoardEventsForMonths() {
        $('.bs-datepicker-body').keydown((event) => {
            const action = this.keyEventPluginInstance.getEventFullKey(event);
            let newdate;
            if (action === 'arrowdown') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(+3, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            } else if (action === 'arrowup') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(-3, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            } else if (action === 'arrowleft') {
                newdate = moment(this.activeDate).add(-1, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            } else if (action === 'arrowright') {
                newdate = moment(this.activeDate).add(+1, 'month').toDate();
                this.setActiveMonthFocus(newdate);
            } else if (action === 'control.arrowup') {
                // clicking on table header year to load list of years
                $('.bs-datepicker-head .current').first().click();
                this.loadYears();
                this.setActiveYearFocus(this.activeDate);
            } else if (action === 'control.arrowdown' || action === 'enter') {
                $(document.activeElement).click();
                this.loadDays();
                this.setActiveDateFocus(this.activeDate);
            }
        });
    }

    /**
     * This method is used to add tabindex, keybord and mouse events for years
     */
    private loadYears() {
        setTimeout(() => {
            const datePickerBody = $('.bs-datepicker-body');
            datePickerBody.attr('tabindex', '0');
            datePickerBody.find('table.years span').attr('tabindex', '0');
            this.addKeyBoardEventsForYears();
            this.addDatepickerMouseEvents();
        });
    }

    /**
     * This method is used to set focus for active month
     */
    private setActiveMonthFocus(newDate, isMoouseEvent?: boolean) {
        const newMonth = months[newDate.getMonth()];
        // check for keyboard event
        if (!isMoouseEvent) {
            if (newDate.getFullYear() < this.activeDate.getFullYear()) {
                this.goToOtherMonthOryear('previous', 'month');
            } else if (newDate.getFullYear() > this.activeDate.getFullYear()) {
                this.goToOtherMonthOryear('next', 'month');
            }
        }
        setTimeout( () => {
            $(`.bs-datepicker-body table.months span:contains(${newMonth})`).focus();
            this.activeDate = newDate;
        });
    }

    /**
     * This method sets keyboard events for years
     */
    private addKeyBoardEventsForYears() {
        $('.bs-datepicker-body').keydown((event) => {
            const action = this.keyEventPluginInstance.getEventFullKey(event);
            let newdate;
            if (action === 'arrowdown') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(+4, 'year').toDate();
                this.setActiveYearFocus(newdate);
            } else if (action === 'arrowup') {
                event.preventDefault();
                newdate = moment(this.activeDate).add(-4, 'year').toDate();
                this.setActiveYearFocus(newdate);
            } else if (action === 'arrowleft') {
                newdate = moment(this.activeDate).add(-1, 'year').toDate();
                this.setActiveYearFocus(newdate);
            } else if (action === 'arrowright') {
                newdate = moment(this.activeDate).add(+1, 'year').toDate();
                this.setActiveYearFocus(newdate);
            }  else if (action === 'control.arrowdown' || action === 'enter') {
                $(document.activeElement).click();
                this.loadMonths();
                this.setActiveMonthFocus(this.activeDate);
            }
        });
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
            if (newDate.getFullYear() < _.parseInt(startYear)) {
                this.goToOtherMonthOryear('previous', 'year');
            } else if (newDate.getFullYear() > _.parseInt(endYear)) {
                this.goToOtherMonthOryear('next', 'year');
            }
        }
        setTimeout( () => {
            $(`.bs-datepicker-body table.years span:contains(${newYear})`).focus();
            this.activeDate = newDate;
        });
    }

    /**
     * This method sets focus for timepicker first input field(hours field) while opening time picker
     * @param scope - scope of the time picker widget
     */
    protected focusTimePickerPopover(scope) {
        this.keyEventPluginInstance = scope.keyEventPlugin;
        this.elementScope = scope;
        // setTimeout is used so that by then time input has the updated value. focus is setting back to the input field
        this.elementScope.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                $('timepicker .form-group:first > input.form-control').focus();
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

    /**
     * This function sets the events to given element
     * @param $el - element on which the event is added
     */
    private addEventsOnTimePicker($el: JQuery) {
        $el.on('keydown', evt => {
            const $target = $(evt.target);
            const $parent = $target.parent();

            const action = this.keyEventPluginInstance.getEventFullKey(evt);

            let stopPropogation, preventDefault;

            if (action === 'escape') {
                this.elementScope.hideTimepickerDropdown();
            }

            if ($target.hasClass('bs-timepicker-field')) {
                if ($parent.is(':first-child')) {
                    if (action === 'shift.tab' || action === 'enter' || action === 'escape') {
                        this.elementScope.setIsTimeOpen(false);
                        this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                } else if ($parent.is(':last-child')) {
                    if (action === 'tab' || action === 'escape') {
                        this.elementScope.setIsTimeOpen(false);
                        this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                } else {
                    if (action === 'enter' || action === 'escape') {
                        this.elementScope.setIsTimeOpen(false);
                        this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                }
                if (stopPropogation) {
                    evt.stopPropagation();
                }
                if (preventDefault) {
                    evt.preventDefault();
                }
            } else if ($target.hasClass('btn-default')) {
                if (action === 'tab' || action === 'escape') {
                    this.elementScope.setIsTimeOpen(false);
                    this.focus();
                }
            }
        });
    }

    protected updateFormat(pattern) {
        if (pattern === 'datepattern') {
            this._dateOptions.dateInputFormat = this.datepattern;
            this.showseconds = _.includes(this.datepattern, 's');
            this.ismeridian = _.includes(this.datepattern, 'h');
        } else if (pattern === 'timepattern') {
            this.showseconds = _.includes(this.timepattern, 's');
            this.ismeridian = _.includes(this.timepattern, 'h');
        }
    }

    onPropertyChange(key, nv, ov?) {

        if (key === 'tabindex') {
            return;
        }

        if (key === 'datepattern') {
            this.updateFormat(key);
        } else if (key === 'showweeks') {
            this._dateOptions.showWeekNumbers = nv;
        } else if (key === 'mindate') {
            this._dateOptions.minDate = getDateObj(nv);
        } else if (key === 'maxdate') {
            this._dateOptions.maxDate = getDateObj(nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.bsDatePickerDirective) {
            this.dateOnShowSubscription = this.bsDatePickerDirective
                .onShown
                .subscribe(cal => {
                    cal.daysCalendar.subscribe(data => {
                        let excludedDates;
                        if (this.excludedates) {
                            if (isString(this.excludedates)) {
                                excludedDates = _.split(this.excludedates, ',');
                            } else {
                                excludedDates = this.excludedates;
                            }
                            excludedDates = excludedDates.map(d => moment(d));
                        }
                        data[0].weeks.forEach(week => {
                            week.days.forEach(day => {
                                if (!day.isDisabled && this.excludedays) {
                                    day.isDisabled = _.includes(this.excludedays, day.dayIndex);
                                }

                                if (!day.isDisabled && excludedDates) {
                                    const md = moment(day.date);
                                    day.isDisabled = excludedDates.some(ed => md.isSame(ed, 'day'));
                                }
                            });
                        });
                    });
                });
        }

    }

    ngOnDestroy() {
        if (this.dateOnShowSubscription) {
            this.dateOnShowSubscription.unsubscribe();
        }

        super.ngOnDestroy();
    }
}