import { Component, Inject, Injector, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { TimepickerConfig } from 'ngx-bootstrap/timepicker';
import {
    $appDigest,
    AbstractI18nService,
    addClass,
    addEventListenerOnElement,
    adjustContainerRightEdges,
    App,
    AppDefaults,
    EVENT_LIFE,
    FormWidgetType,
    getDisplayDateTimeFormat,
    getFormattedDate,
    getNativeDateObject
} from '@wm/core';
import { provideAsWidgetRef, provideAs, styler } from '@wm/components/base';

import {BaseDateTimeComponent, getTimepickerConfig} from './../base-date-time.component';
import { registerProps } from './time.props';

const CURRENT_TIME = 'CURRENT_TIME';
const DEFAULT_CLS = 'input-group app-timeinput';
const WIDGET_CONFIG = {widgetType: 'wm-time', hostClass: DEFAULT_CLS};

declare const _, moment, $;

@Component({
    selector: '[wmTime]',
    templateUrl: './time.component.html',
    providers: [
        provideAs(TimeComponent, NG_VALUE_ACCESSOR, true),
        provideAs(TimeComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(TimeComponent),
        { provide: TimepickerConfig,  deps: [AbstractI18nService], useFactory: getTimepickerConfig }
    ]
})
export class TimeComponent extends BaseDateTimeComponent implements OnDestroy {
    static initializeProps = registerProps();
    /**
     * This property sets the display pattern of the time selected
     */
    timepattern: string;

    /**
     * This property sets the output format for the selected time datavalue
     */
    outputformat: string;

    public showdropdownon: string;
    public mintime;
    public maxtime;

    private deregisterEventListener;
    private app: App;
    private displayInputElem: HTMLElement;

    get timestamp() {
        return this.bsTimeValue ? this.bsTimeValue.valueOf() : undefined;
    }

    get datavalue(): any {
        if (this.isCurrentTime && !this.bsTimeValue) {
            return CURRENT_TIME;
        }
        return getFormattedDate(this.datePipe, this.bsTimeValue, this.outputformat) || '';
    }

    /**Todo[Shubham]: needs to be redefined
     * This property sets the default value for the time selection
     */
    set datavalue(newVal: any) {
        if (newVal) {
            if (newVal === CURRENT_TIME) {
                this.isCurrentTime = true;
                this.setTimeInterval();
            } else {
                this.clearTimeInterval();
                this.bsTimeValue = getNativeDateObject(newVal, { pattern: this.loadNativeDateInput ? this.outputformat : undefined, isNativePicker: this.loadNativeDateInput});
                this.isCurrentTime = false;
                this.mintimeMaxtimeValidation();
            }
        } else {
            this.bsTimeValue = undefined;
            this.clearTimeInterval();
            this.isCurrentTime = false;
        }
        this.invokeOnChange(this.datavalue);
        $appDigest();
    }

    get displayValue() {
        return getFormattedDate(this.datePipe, this.bsTimeValue, this.timepattern) || '';
    }

    get nativeDisplayValue() {
        return getFormattedDate(this.datePipe, this.bsTimeValue, 'HH:mm:ss') || '';
    }

    /* Internal property to have a flag to check the given datavalue is of Current time*/
    public isCurrentTime: boolean;

    private timeinterval: any;

    /**
     * This is an internal property used to map it to the widget
     */
    private minTime: Date;

    /**
     * This is an internal property used to map it to the widget
     */
    private maxTime: Date;

    /**
     * This is an internal property used to toggle the timepicker dropdown
     */
    public status = { isopen: false };

    /**
     * This is an internal property used to map the main model to the time widget
     */
    private bsTimeValue: Date;

    private keyEventPlugin;

    constructor(
        inj: Injector,
        private ngZone: NgZone,
        private appDefaults: AppDefaults,
        app: App,
        @Inject(EVENT_MANAGER_PLUGINS) evtMngrPlugins
    ) {
        super(inj, WIDGET_CONFIG);

        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1];

        styler(this.nativeElement, this);
        /**
         * Destroy the timer once the date widget is gone
         */
        this.registerDestroyListener(() => this.clearTimeInterval());

        this.timepattern = this.appDefaults.timeFormat || getDisplayDateTimeFormat(FormWidgetType.TIME);
        this.updateFormat('timepattern');
        this.app = app;
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'timepattern') {
           this.updateFormat('timepattern');
        }
        if (key === 'mintime') {
            this.minTime = getNativeDateObject(nv, { pattern: this.loadNativeDateInput ? this.outputformat : undefined, isNativePicker: this.loadNativeDateInput }); // TODO it is supposed to be time conversion, not to the day
            this.mintimeMaxtimeValidation();
        } else if (key === 'maxtime') {
            this.maxTime = getNativeDateObject(nv, { pattern: this.loadNativeDateInput ? this.outputformat : undefined, isNativePicker: this.loadNativeDateInput });
            this.mintimeMaxtimeValidation();
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    setValidateType(min, max, val) {
        if (this.timeNotInRange) {
            if (val < min) {
                (this as any).validateType = 'mintime';
            } else if (val > max) {
                (this as any).validateType = 'maxtime';
            }
        }
    }

    /**
     * This is an internal method used to validate mintime and maxtime
     */
    private mintimeMaxtimeValidation() {
        this.timeNotInRange = this.minTime && this.maxTime && (this.bsTimeValue < this.minTime || this.bsTimeValue > this.maxTime);
        this.setValidateType(this.minTime, this.maxTime, this.bsTimeValue);
        this.invokeOnChange(this.datavalue, undefined, false);
    }

    /**
     * This is an internal method used to toggle the dropdown of the time widget
     */
     public toggleDropdown($event, skipFocus: boolean = false): void {
        if (this.loadNativeDateInput) {
            //Fixes click event getting triggred twice in Mobile devices.
            if(!skipFocus){
                this.onDateTimeInputFocus();
            }
            return;
        }
        if ($event.type === 'click') {
            this.invokeEventCallback('click', {$event: $event});
            this.focusOnInputEl();
        }
        if ($event.target && $($event.target).is('input') && !(this.isDropDownDisplayEnabledOnInput(this.showdropdownon))) {
            return;
        }
        this.ngZone.run(() => {
            this.status.isopen = !this.status.isopen;
        });
        this.addBodyClickListener(this.status.isopen);
    }

    /**
     * This is an internal method used to Prevent time picker close while changing time value
     */
    private preventTpClose($event) {
        $event.stopImmediatePropagation();
        const parentEl = $(this.nativeElement).closest('.app-composite-widget.caption-floating');
        if (parentEl.length > 0) {
            this.app.notify('captionPositionAnimate', {displayVal: this.displayValue, nativeEl: parentEl});
        }
    }

    private addBodyClickListener(skipListener) {
        if (!skipListener) {
            return;
        }
        const bodyElement = document.querySelector('body');
        setTimeout(() => {
            const dropdownElement = $(bodyElement).find('>bs-dropdown-container .dropdown-menu').get(0);
            this.deregisterEventListener = addEventListenerOnElement(bodyElement, dropdownElement, this.nativeElement, 'click', this.isDropDownDisplayEnabledOnInput(this.showdropdownon), () => {
                this.status.isopen = false;
            }, EVENT_LIFE.ONCE, true);
        }, 350);
    }

    /**
     * This is an internal method triggered when pressing key on the time input
     */
    public onDisplayKeydown(event) {
        if (this.isDropDownDisplayEnabledOnInput(this.showdropdownon)) {
            event.stopPropagation();
            const action = this.keyEventPlugin.constructor.getEventFullKey(event);
            if (action === 'enter' || action === 'arrowdown') {
                event.preventDefault();
                this.toggleDropdown(event);
            } else {
                this.hideTimepickerDropdown();
            }
        } else {
            this.hideTimepickerDropdown();
        }
    }

    /**
     * This is an internal method triggered when the time input changes
     */
    onDisplayTimeChange($event) {
        const newVal = getNativeDateObject($event.target.value, {meridians: this.meridians, pattern: this.loadNativeDateInput ? this.outputformat : undefined, isNativePicker: this.loadNativeDateInput });
        // time pattern validation
        // if invalid pattern is entered, device is showing an error.
        if (!this.formatValidation(newVal, $event.target.value)) {
            return;
        }
        this.invalidDateTimeFormat = false;
        this.onTimeChange(newVal);
    }

    onInputBlur($event) {
        if (!$($event.relatedTarget).hasClass('bs-timepicker-field')) {
            this.invokeOnTouched();
            this.invokeEventCallback('blur', {$event});
        }
    }

    /**
     * This is an internal method used to execute the on time change functionality
     */
    private onTimeChange(newVal, isNativePicker?: boolean) {
        let timeValue,
            timeInputValue,
            minTimeMeridian,
            maxTimeMeridian;
        // For nativePicker, newVal is event, get the dateobject from the event.
        if (isNativePicker) {
            newVal = getNativeDateObject(newVal.target.value, { pattern: this.loadNativeDateInput ? this.outputformat : undefined, isNativePicker: this.loadNativeDateInput });
        }
        if (newVal) {
            this.bsTimeValue = newVal;
            // if the newVal is valid but not in the given range then highlight the input field
            this.timeNotInRange = this.minTime && this.maxTime && (newVal < this.minTime || newVal > this.maxTime);
            this.setValidateType(this.minTime, this.maxTime, newVal);
        } else {
            // sometimes library is not returning the correct value when the min and max time are given, displaying the datavalue based on the value given by the user
            if (this.bsTimePicker && this.bsTimePicker.min && this.bsTimePicker.max) {
                minTimeMeridian = moment(new Date(this.bsTimePicker.min)).format('A');
                maxTimeMeridian = moment(new Date(this.bsTimePicker.max)).format('A');
                timeValue = this.bsTimePicker.hours + ':' + (this.bsTimePicker.minutes || 0) + ':' + (this.bsTimePicker.seconds || 0) + (this.bsTimePicker.showMeridian ? (' ' + minTimeMeridian) : '');
                timeInputValue =  getNativeDateObject(timeValue, { pattern: this.loadNativeDateInput ? this.outputformat : undefined, isNativePicker: this.loadNativeDateInput });
                this.bsTimePicker.meridian = minTimeMeridian;
                this.timeNotInRange = (this.bsTimePicker.min > timeInputValue || this.bsTimePicker.max < timeInputValue);
                this.setValidateType(this.bsTimePicker.min, this.bsTimePicker.max, timeInputValue);
            }
            this.bsTimeValue = timeInputValue;
        }
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue, {}, true);
    }

    /**
     * This is an internal method used to maintain a time interval to update the time model when the data value is set to CURRENT_TIME
     */
    private setTimeInterval() {
        if (this.timeinterval) {
            return;
        }
        this.timeinterval = setInterval( () => {
            const now = new Date();
            now.setSeconds(now.getSeconds() + 1);
            this.datavalue = CURRENT_TIME;
            this.onTimeChange(now);
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
     * This function sets the value isOpen/isTimeOpen (i.e when datepicker popup is closed) based on widget type(i.e  DateTime, Time)
     * @param val - isOpen/isTimeOpen is set based on the timepicker popup is open/closed
     */
    private setIsTimeOpen(val: boolean) {
        this.status.isopen = val;
    }

    // Change event is registered from the template, Prevent the framework from registering one more event
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        if (!_.includes(['blur', 'focus', 'change', 'click'], eventName)) {
            super.handleEvent(node, eventName, eventCallback, locals);
        }
    }

    public hideTimepickerDropdown() {
        this.invokeOnTouched();
        this.status.isopen = false;
        if (this.deregisterEventListener) {
            this.deregisterEventListener();
        }
        this.removeKeyupListener();
        const parentEl = $(this.nativeElement).closest('.app-composite-widget.caption-floating');
        if (parentEl.length > 0) {
            this.app.notify('captionPositionAnimate', {displayVal: this.displayValue, nativeEl: parentEl});
        }
    }

    private isValid(event) {
        if (!event) {
            const enteredDate = $(this.nativeElement).find('input').val();
            const newVal = getNativeDateObject(enteredDate, {meridians: this.meridians, pattern: this.loadNativeDateInput ? this.outputformat : undefined, isNativePicker: this.loadNativeDateInput });
            if (!this.formatValidation(newVal, enteredDate)) {
                return;
            }
        }
    }
    /**
     * This is an internal method to add css class for dropdown while opening the time dropdown
     */
    public onShown() {
        const tpElements  = document.querySelectorAll('timepicker');
        _.forEach(tpElements, element => {
            addClass(element.parentElement as HTMLElement, 'app-datetime', true);
        });
        this.focusTimePickerPopover(this);
        this.bindTimePickerKeyboardEvents();
        adjustContainerRightEdges($('bs-dropdown-container'), this.nativeElement, this.bsDropdown._dropdown, $('bs-dropdown-container .dropdown-menu'));
    }

    public assignModel() {
        if (!this.displayInputElem) {
            this.displayInputElem = this.getMobileInput();
        }
        (this.displayInputElem as any).value = _.get(this, 'nativeDisplayValue');
    }
}
