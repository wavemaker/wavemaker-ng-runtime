import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnDestroy, ViewChild, NgZone, Inject } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';

import { BsDatepickerDirective } from 'ngx-bootstrap';

import { addClass, addEventListenerOnElement, EVENT_LIFE, getDateObj, getFormattedDate, getNativeDateObject, setAttr } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './date-time.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { BaseDateTimeComponent } from '../base/base-date-time.component';

const DEFAULT_CLS = 'app-datetime input-group';
const WIDGET_CONFIG = {widgetType: 'wm-datetime', hostClass: DEFAULT_CLS};

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
    private ismeridian: boolean;
    private proxyModel;

    public showdropdownon: string;
    public useDatapicker = true;
    private keyEventPlugin;
    private deregisterDatepickerEventListener;
    private deregisterTimepickeEventListener;

    get timestamp() {
        return this.bsDateTimeValue ? this.bsDateTimeValue.valueOf() : undefined;
    }

    /**
     * The displayValue is the display value of the bsDateTimeValue after applying the datePattern on it.
     * @returns {any|string}
     */
    get displayValue(): any {
        return getFormattedDate(this.datePipe, this.proxyModel, this._dateOptions.dateInputFormat) || '';
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

    private _debouncedOnChange: Function =  _.debounce(this.invokeOnChange, 10);

    private dateContainerCls: string;

    get datavalue(): any {
        return getFormattedDate(this.datePipe, this.proxyModel, this.outputformat);
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
        this.proxyModel = newVal ? getDateObj(newVal) : undefined;

        this.bsTimeValue = this.bsDateValue = this.proxyModel;
        this.isCurrentDate = false;
        this.clearTimeInterval();
        this.cdRef.detectChanges();
    }

    constructor(inj: Injector, public datePipe: ToDatePipe, private ngZone: NgZone, private cdRef: ChangeDetectorRef,
                @Inject(EVENT_MANAGER_PLUGINS) evtMngrPlugins) {
        super(inj, WIDGET_CONFIG);
        this.registerDestroyListener(() => this.clearTimeInterval());
        styler(this.nativeElement, this);
        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1].constructor;
        this.dateContainerCls = `app-date-${this.widgetId}`;
        this._dateOptions.containerClass = `theme-red ${this.dateContainerCls}`;
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
        this.addTimepickerClickListener(this.isTimeOpen);
    }

    private addTimepickerClickListener(skipListener) {
        if (!skipListener) {
            return;
        }
        const bodyElement = document.querySelector('body');
        const evt = new Event('click');
        setTimeout(() => {
            const dropdownElement = bodyElement.querySelector('.dropdown-menu');
            this.deregisterTimepickeEventListener = addEventListenerOnElement(bodyElement, dropdownElement, this.nativeElement, 'click', () => {
                this.toggleTimePicker(false);
            }, EVENT_LIFE.ONCE, true);
        }, 350);
    }

    private focusPopover() {
        // setTimeout is used so that by then time input has the updated value. focus is setting back to the input field
        this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                $('timepicker .form-group:first > input.form-control').focus();
            });
        });

    }

    /**
     * This function sets the value isOpen/isTimeOpen (i.e when datepicker popup is closed) based on widget type(i.e  DateTime, Time)
     * @param val - isOpen/isTimeOpen is set based on the timepicker popup is open/closed
     */
    private setIsTimeOpen(val: boolean) {
        this.isTimeOpen = val;
    }

    /**
     * This function sets the events to given element
     * @param $el - element on which the event is added
     */
    private addEventsOnTimePicker($el: JQuery) {
        $el.on('keydown', evt => {
            const $target = $(evt.target);
            const $parent = $target.parent();

            const action = this.keyEventPlugin.getEventFullKey(evt);

            let stopPropogation, preventDefault;
            if (action === 'shift.tab' || action === 'escape') {
                this.hideTimepickerDropdown();
            }
            if ($target.hasClass('bs-timepicker-field')) {
                if ($parent.is(':first-child')) {
                    if (action === 'shift.tab' || action === 'enter' || action === 'escape') {
                        this.setIsTimeOpen(false);
                        this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                } else if ($parent.is(':last-child')) {
                    if (action === 'tab' || action === 'escape') {
                        this.setIsTimeOpen(false);
                        this.focus();
                        stopPropogation = true;
                        preventDefault = true;
                    }
                } else {
                    if (action === 'enter' || action === 'escape') {
                        this.setIsTimeOpen(false);
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
                    this.setIsTimeOpen(false);
                    this.focus();
                }
            }
        });
    }

    /**
     * This function sets the keyboard events to Timepicker popup
     */
    private bindTimePickerKeyboardEvents() {
        setTimeout(() => {
            const $timepickerPopup = $('body').find('> bs-dropdown-container timepicker');
            $timepickerPopup.attr('tabindex', 0);
            this.addEventsOnTimePicker($timepickerPopup);
        });
    }

    private hideTimepickerDropdown() {
        this.toggleTimePicker(false);
        this.deregisterTimepickeEventListener();
        const displayInputElem = this.nativeElement.querySelector('.display-input') as HTMLElement;
        setTimeout(() => displayInputElem.focus());
    }

    /**
     * This is an internal method to add a click listener once the time dropdown is open
     */
    private onTimepickerOpen() {
        // adding class for time widget dropdown menu
        const tpElements  = document.querySelectorAll('timepicker');
        _.forEach(tpElements, (element) => {
            addClass(element.parentElement as HTMLElement, 'app-datetime');
        });

        this.bsDatePickerDirective.hide();
        this.focusPopover();
        this.bindTimePickerKeyboardEvents();
    }

    private onDatePickerOpen() {
        this.isDateOpen = !this.isDateOpen;
        this.toggleTimePicker(false);
        this.invokeOnTouched();
        const dateContainer  = document.querySelector(`.${this.dateContainerCls}`) as HTMLElement;
        setAttr(dateContainer, 'tabindex', '0');
        this.addDatepickerKeyboardEvents(dateContainer);
        setTimeout(() => dateContainer.focus());
    }


    private addDatepickerKeyboardEvents(dateContainer) {
        dateContainer.onkeydown = (event) => {
            const action = this.keyEventPlugin.getEventFullKey(event);
            // Check for Tab key or escape
            if (action === 'escape') {
                this.hideDatepickerDropdown();
            }
            if (action === 'tab') {
                this.bsDatePickerDirective.hide();
                this.toggleTimePicker(true);
            }
            if (action === 'shift.tab') {
                this.hideDatepickerDropdown();
            }
        };
    }

    /**
     * This is an internal method to update the model
     */
    private onModelUpdate(newVal, type?) {
        if (!newVal) {
            this.proxyModel = undefined;
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
    private toggleDpDropdown($event) {
        if ($event.target && $($event.target).is('input') && (this.showdropdownon === 'button')) {
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
            this.deregisterDatepickerEventListener = addEventListenerOnElement(bodyElement, bsDateContainerElement, this.nativeElement, 'click', () => {
                this.bsDatePickerDirective.hide();
            }, EVENT_LIFE.ONCE, true);
        }, 350);
    }

    private hideDatepickerDropdown() {
        this.bsDatePickerDirective.hide();
        this.deregisterDatepickerEventListener();
        const displayInputElem = this.nativeElement.querySelector('.display-input') as HTMLElement;
        setTimeout(() => displayInputElem.focus());

    }

    private onDateChange($event) {
        let newVal = $event.target.value.trim();
        newVal = newVal ? getNativeDateObject(newVal) : undefined;
        this.onModelUpdate(newVal);
    }

    /**
     * This is an internal method triggered when pressing key on the datetime input
     */
    private onDisplayKeydown(event) {
        const action = this.keyEventPlugin.getEventFullKey(event);
        if (action === 'enter' || action === 'arrowdown') {
            this.toggleDpDropdown(event);
        }
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'autofocus' && nv) {
            const inputElement = this.$element.find('.display-input')[0] as HTMLElement;
            setAttr(inputElement, key, nv);
        }
        if (key === 'datepattern') {
            this.showseconds = _.includes(nv, 's');
            this.ismeridian = _.includes(nv, 'h');
        }
        super.onPropertyChange(key, nv, ov);
    }
}
