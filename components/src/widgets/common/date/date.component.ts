import { ChangeDetectorRef, Component, Injector, ViewChild, Inject } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';

import { BsDatepickerDirective } from 'ngx-bootstrap';

import { EVENT_LIFE, addEventListenerOnElement, getDateObj, getFormattedDate, getDisplayDateTimeFormat, FormWidgetType, AppDefaults } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './date.props';
import { provideAsNgValidators, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { BaseDateTimeComponent } from '../base/base-date-time.component';

registerProps();

declare const _;
declare const moment;

const CURRENT_DATE: string = 'CURRENT_DATE';
const DEFAULT_CLS = 'app-date input-group';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-date',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmDate]',
    templateUrl: './date.component.html',
    providers: [
        provideAsNgValueAccessor(DateComponent),
        provideAsNgValidators(DateComponent),
        provideAsWidgetRef(DateComponent)
    ]
})
export class DateComponent extends BaseDateTimeComponent {
    private bsDataValue;
    public showdropdownon: string;
    public useDatapicker = true;
    private dateContainerCls: string;
    private isCurrentDate = false;
    private isOpen: boolean;
    private timeinterval;
    private isEnterPressedOnDateInput = false;

    private keyEventPlugin;
    private deregisterEventListener;

    get timestamp() {
        return this.bsDataValue ? this.bsDataValue.valueOf() : undefined;
    }

    get displayValue() {
        return getFormattedDate(this.datePipe, this.bsDataValue, this._dateOptions.dateInputFormat) || '';
    }

    get datavalue () {
        return getFormattedDate(this.datePipe, this.bsDataValue, this.outputformat) || '';
    }

    // Todo[Shubham]: needs to be redefined
    // sets the dataValue and computes the display model values
    set datavalue(newVal) {
        if (newVal === CURRENT_DATE) {
            this.isCurrentDate = true;
            this.setTimeInterval();
            this.bsDataValue = new Date();
        } else {
            this.bsDataValue = newVal ? getDateObj(newVal) : undefined;
            this.clearTimeInterval();
        }
        // update the previous datavalue.
        this.invokeOnChange(this.datavalue, undefined, true);
        this.cdRef.detectChanges();
    }

    @ViewChild(BsDatepickerDirective) protected bsDatePickerDirective;

    // TODO use BsLocaleService to set the current user's locale to see the localized labels
    constructor(inj: Injector,
                public datePipe: ToDatePipe,
                private cdRef: ChangeDetectorRef,
                private appDefaults: AppDefaults,
                @Inject(EVENT_MANAGER_PLUGINS) evtMngrPlugins) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);

        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1];
        this.dateContainerCls = `app-date-${this.widgetId}`;
        this._dateOptions.containerClass = `app-date ${this.dateContainerCls}`;
        this._dateOptions.showWeekNumbers = false;

        this.datepattern = this.appDefaults.dateFormat || getDisplayDateTimeFormat(FormWidgetType.DATE);
        this.updateFormat('datepattern');
    }

    /**
     * This is an internal method triggered when the date input changes
     */
    onDisplayDateChange($event, isNativePicker) {
        if (this.isEnterPressedOnDateInput) {
            this.isEnterPressedOnDateInput = false;
            return;
        }
        const newVal = getDateObj($event.target.value);
        // date pattern validation
        // if invalid pattern is entered, device is showing an error.
        if(!this.formatValidation(this.datePipe, newVal, $event.target.value)) {
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
        if(getFormattedDate(this.datePipe, newVal, this._dateOptions.dateInputFormat) === this.displayValue) {
            $(this.nativeElement).find('.app-dateinput').val(this.displayValue);
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
        this.addDatepickerKeyboardEvents(this, false);
    }
    onInputBlur($event) {
        if (!$($event.relatedTarget).hasClass('current-date')) {
            this.invokeOnTouched();
            this.invokeEventCallback('blur', {$event});
        }
    }

    private hideDatepickerDropdown() {
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
        if ($event.type === 'click') {
            this.invokeEventCallback('click', {$event: $event});
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
    private onDisplayKeydown(event) {
        if (this.isDropDownDisplayEnabledOnInput(this.showdropdownon)) {
            event.stopPropagation();
            const newVal = getDateObj(event.target.value);
            const action = this.keyEventPlugin.constructor.getEventFullKey(event);
            if (action === 'enter' || action === 'arrowdown') {
                event.preventDefault();
                const formattedDate = getFormattedDate(this.datePipe, newVal, this._dateOptions.dateInputFormat);
                const inputVal = event.target.value.trim();
                if (inputVal && this.datepattern === 'timestamp') {
                    if(!_.isNaN(inputVal) && _.parseInt(inputVal) !== formattedDate) {
                        this.invalidDateTimeFormat = true;
                        this._onChange();
                    }
                } else if(inputVal && inputVal !== formattedDate ) {
                    this.invalidDateTimeFormat = true;
                    this._onChange();
                } else {
                    this.invalidDateTimeFormat = false;
                    this.isEnterPressedOnDateInput = true;
                    this.bsDatePickerDirective.bsValue =  newVal;
                }
                this.toggleDpDropdown(event);
            }
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
            this.bsDataValue = new Date();
        }, 1000 * 60);
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
     * This is an internal method triggered when the date selection changes
     */
    onDateChange(newVal): void {
        const displayInputElem = this.nativeElement.querySelector('.display-input') as HTMLElement;
        setTimeout(() => displayInputElem.focus());
        this.setDataValue(newVal);
    }
}
