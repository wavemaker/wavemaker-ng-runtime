import {ChangeDetectorRef, Component, Inject, Injector, Optional, ViewChild} from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';

import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';

import {
    adjustContainerPosition,
    addEventListenerOnElement,
    AppDefaults,
    EVENT_LIFE,
    FormWidgetType,
    getDateObj,
    getDisplayDateTimeFormat,
    getFormattedDate,
    adjustContainerRightEdges,
    getMomentLocaleObject,
    App
} from '@wm/core';
import { IWidgetConfig, provideAs, provideAsWidgetRef, setFocusTrap, styler } from '@wm/components/base';
import { BaseDateTimeComponent } from './../base-date-time.component';
import { registerProps } from './date.props';

declare const _, $, moment;

const CURRENT_DATE = 'CURRENT_DATE';
const DEFAULT_CLS = 'app-date input-group';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-date',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmDate]',
    templateUrl: './date.component.html',
    providers: [
        provideAs(DateComponent, NG_VALUE_ACCESSOR, true),
        provideAs(DateComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(DateComponent)
    ]
})
export class DateComponent extends BaseDateTimeComponent {
    static initializeProps = registerProps();

    public bsDataValue;
    public showdropdownon: string;
    private dateContainerCls: string;
    public isOpen: boolean = false;
    private isEnterPressedOnDateInput = false;
    private _bsDefaultLoadCheck: boolean;
    public hint: string;

    private keyEventPlugin;
    private deregisterEventListener;
    private isCurrentDate;
    private focusTrap;

    get timestamp() {
        return this.bsDataValue ? this.bsDataValue.valueOf() : undefined;
    }

    get dateInputFormat() {
        return this._dateOptions.dateInputFormat || 'yyyy-MM-dd';
    }

    get displayValue() {
        return getFormattedDate(this.datePipe, this.bsDataValue, this.dateInputFormat, this.timeZone, null, this.isCurrentDate, this) || '';
    }

    get nativeDisplayValue() {
        return getFormattedDate(this.datePipe, this.bsDataValue, 'yyyy-MM-dd', this.timeZone, null, this.isCurrentDate, this) || '';
    }

    // @ts-ignore
    get datavalue() {
        return getFormattedDate(this.datePipe, this.bsDataValue, this.outputformat, this.timeZone, null, this.isCurrentDate, this) || '';
    }

    // Todo[Shubham]: needs to be redefined
    // sets the dataValue and computes the display model values
    // @ts-ignore
    set datavalue(newVal) {
        if (newVal === CURRENT_DATE) {
            setTimeout(() => {
                this.bsDataValue = this.timeZone ? getMomentLocaleObject(this.timeZone) : new Date();
            }, 50);
            this.isCurrentDate = true;
        } else {
            this.bsDataValue = newVal ? getDateObj(newVal, {isNativePicker: this.loadNativeDateInput}, this.timeZone) : undefined;
            this.isCurrentDate = false;
        }
        // update the previous datavalue.
        this.invokeOnChange(this.datavalue, undefined, true);
        this.cdRef.detectChanges();
    }

    @ViewChild(BsDatepickerDirective) protected bsDatePickerDirective;

    // TODO use BsLocaleService to set the current user's locale to see the localized labels
    constructor(
        inj: Injector,
        private cdRef: ChangeDetectorRef,
        private appDefaults: AppDefaults,
        @Inject(EVENT_MANAGER_PLUGINS) evtMngrPlugins
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);

        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1];
        this.dateContainerCls = `app-date-${this.widgetId}`;
        this._dateOptions.containerClass = `app-date ${this.dateContainerCls}`;
        this._dateOptions.showWeekNumbers = false;
        this._bsDefaultLoadCheck = true;
        this.datepattern = this.appDefaults.dateFormat || getDisplayDateTimeFormat(FormWidgetType.DATE);
        this.updateFormat('datepattern');
    }

    /**
     * This is an internal method triggered when the date input changes
     */
    onDisplayDateChange($event, isNativePicker: boolean = false) {
        if (this.isEnterPressedOnDateInput) {
            this.isEnterPressedOnDateInput = false;
            return;
        }
        const newVal = getDateObj($event.target.value, {pattern: this.datepattern, isNativePicker: isNativePicker});
        // date pattern validation
        // if invalid pattern is entered, device is showing an error.
        if (!this.formatValidation(newVal, $event.target.value, isNativePicker)) {
            return;
        }
        // min date and max date validation in mobile view.
        // if invalid dates are entered, device is showing an alert.
        if (isNativePicker && this.minDateMaxDateValidationOnInput(newVal, $event, this.displayValue, isNativePicker)) {
            return;
        }
        this.setDataValue(newVal);
    }

    // sets the dataValue and computes the display model values
    private setDataValue(newVal): void {
        this.invalidDateTimeFormat = false;
        // min date and max date validation in web.
        // if invalid dates are entered, device is showing validation message.
        this.minDateMaxDateValidationOnInput(newVal);
        if (getFormattedDate(this.datePipe, newVal, this.dateInputFormat, this.timeZone, null, this.isCurrentDate, this) === this.displayValue) {
            $(this.nativeElement).find('.display-input').val(this.displayValue);
        }
        if (newVal) {
            this.bsDataValue = newVal;
        } else {
            this.bsDataValue = undefined;
        }
        this.invokeOnChange(this.datavalue, {}, true);
    }

    onDatePickerOpen() {
        this.isOpen = true;
        this.bsDataValue ? this.activeDate = this.bsDataValue : this.activeDate = new Date();
        if (!this.bsDataValue) {
            this.hightlightToday();
        }

        // We are using the two input tags(To maintain the modal and proxy modal) for the date control.
        // So actual bootstrap input target width we made it to 0, so bootstrap calculating the calendar container top position improperly.
        // To fix the container top position set the width 1px;
        this.$element.find('.model-holder').width('1px');
        const dpContainerEl = $('bs-datepicker-container');
        dpContainerEl.attr('aria-label', 'Use Arrow keys to navigate dates, Choose Date from datepicker');
        $('.bs-calendar-container').removeAttr('role');
        const datePickerContainer = $('.bs-datepicker-container')[0];
        this.focusTrap = setFocusTrap(datePickerContainer, true);
        this.focusTrap.activate();
        this.addDatepickerKeyboardEvents(this, false);
        adjustContainerPosition($('bs-datepicker-container'), this.nativeElement, this.bsDatePickerDirective._datepicker);
        adjustContainerRightEdges($('bs-datepicker-container'), this.nativeElement, this.bsDatePickerDirective._datepicker);
    }
    onInputBlur($event) {
        if (!$($event.relatedTarget).hasClass('current-date')) {
            this.invokeOnTouched();
            this.invokeEventCallback('blur', { $event });
        }
    }

    public hideDatepickerDropdown() {
        this.invokeOnTouched();
        this.isOpen = false;
        this.focusTrap?.deactivate();
        this.isEnterPressedOnDateInput = false;
        if (this.deregisterEventListener) {
            this.deregisterEventListener();
        }
        this.blurDateInput(this.isOpen);
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (!_.includes(['blur', 'focus', 'change', 'click'], eventName)) {
            super.handleEvent(node, eventName, callback, locals);
        }
    }

    /**
     * This is an internal method used to toggle the dropdown of the date widget
     */
     public toggleDpDropdown($event, skipFocus: boolean = false) {
        if (this.loadNativeDateInput) {
            //Fixes click event getting triggred twice in Mobile devices.
            if(!skipFocus){
                this.onDateTimeInputFocus();
            }
        }
        if ($event.type === 'click') {
            this.invokeEventCallback('click', { $event: $event });
            this.focusOnInputEl();
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
            this.deregisterEventListener = addEventListenerOnElement(bodyElement, bsDateContainerElement, this.nativeElement, 'click', this.isDropDownDisplayEnabledOnInput(this.showdropdownon), () => {
                this.isOpen = false;
            }, EVENT_LIFE.ONCE, true);
        }, 350);
    }

    /**
     * This is an internal method triggered when pressing key on the date input
     */
    public onDisplayKeydown(event) {
        if (this.isDropDownDisplayEnabledOnInput(this.showdropdownon)) {
            event.stopPropagation();
            const action = this.keyEventPlugin.constructor.getEventFullKey(event);
            if (action === 'enter') {
                const newVal = getDateObj(event.target.value, {pattern: this.datepattern});
                event.preventDefault();
                const formattedDate = getFormattedDate(this.datePipe, newVal, this.dateInputFormat, this.timeZone, null, this.isCurrentDate, this);
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
                    this.bsDatePickerDirective.bsValue =  event.target.value ? newVal : '';
                }
                this.toggleDpDropdown(event);
            } else {
                this.hideDatepickerDropdown();
            }
        } else {
            this.hideDatepickerDropdown();
        }
    }

    /**
     * This is an internal method triggered when the date selection changes
     */
    onDateChange(newVal): void {

        /**
         *  Ngx-bootstrap upgrade : To avoid the page load datechange event;
         *  TODO:
         *  https://github.com/valor-software/ngx-bootstrap/issues/6016
         *  For above issue, once we get the solution from Ngx-Bootstrap team,  remove the _bsDefaultLoadCheck check and update accordingly.
         * */
        if (this._bsDefaultLoadCheck) {
            this._bsDefaultLoadCheck = false;
            return;
        }

        this.setDataValue(newVal);
    }
}
