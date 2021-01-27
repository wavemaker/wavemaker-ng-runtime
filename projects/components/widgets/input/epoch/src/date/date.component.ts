import { ChangeDetectorRef, Component, Inject, Injector, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';

import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';

import { adjustContainerPosition, addEventListenerOnElement, AppDefaults, EVENT_LIFE, FormWidgetType, getDateObj, getDisplayDateTimeFormat, getFormattedDate, adjustContainerRightEdges, isMobile } from '@wm/core';
import { IWidgetConfig, provideAs, provideAsWidgetRef, styler } from '@wm/components/base';
import { BaseDateTimeComponent } from './../base-date-time.component';
import { registerProps } from './date.props';

declare const _, $;

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
   
    private keyEventPlugin;
    private deregisterEventListener;

    get timestamp() {
        return this.bsDataValue ? this.bsDataValue.valueOf() : undefined;
    }

    get dateInputFormat() {
        return this._dateOptions.dateInputFormat || 'yyyy-MM-dd';
    }

    get displayValue() {
        return getFormattedDate(this.datePipe, this.bsDataValue, this.dateInputFormat) || '';
    }

    get nativeDisplayValue() {
        return getFormattedDate(this.datePipe, this.bsDataValue, 'yyyy-MM-dd') || '';
    }

    get datavalue() {
        return getFormattedDate(this.datePipe, this.bsDataValue, this.outputformat) || '';
    }

    // Todo[Shubham]: needs to be redefined
    // sets the dataValue and computes the display model values
    set datavalue(newVal) {
        if (newVal === CURRENT_DATE) {
            this.bsDataValue = new Date();
        } else {
            this.bsDataValue = newVal ? getDateObj(newVal) : undefined;
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
    onDisplayDateChange($event, isNativePicker?) {
        if (this.isEnterPressedOnDateInput) {
            this.isEnterPressedOnDateInput = false;
            return;
        }
        const newVal = getDateObj($event.target.value, {pattern: this.datepattern});
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
        if (getFormattedDate(this.datePipe, newVal, this.dateInputFormat) === this.displayValue) {
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
        this.isEnterPressedOnDateInput = false;
        if (this.deregisterEventListener) {
            this.deregisterEventListener();
        }
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
    toggleDpDropdown($event) {
        if (isMobile()) {
            this.onDateTimeInputFocus();
            return;
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
            if (action === 'enter' || action === 'arrowdown') {
                const newVal = getDateObj(event.target.value, {pattern: this.datepattern});
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

        const displayInputElem = this.nativeElement.querySelector('.display-input') as HTMLElement;
        if (this.isOpen) {
            setTimeout(() => displayInputElem.focus());
        }
        this.setDataValue(newVal);
    }
}
