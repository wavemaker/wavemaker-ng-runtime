import { Component, Inject, Injector, NgZone, OnDestroy } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';

import { $appDigest, addClass, addEventListenerOnElement, EVENT_LIFE, getFormattedDate, getNativeDateObject, setAttr } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './time.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { BaseDateTimeComponent } from '../base/base-date-time.component';

const CURRENT_TIME: string = 'CURRENT_TIME';
const DEFAULT_CLS = 'input-group app-timeinput';
const WIDGET_CONFIG = {widgetType: 'wm-time', hostClass: DEFAULT_CLS};

declare const _;

registerProps();

@Component({
    selector: '[wmTime]',
    templateUrl: './time.component.html',
    providers: [
        provideAsNgValueAccessor(TimeComponent),
        provideAsWidgetRef(TimeComponent)
    ]
})
export class TimeComponent extends BaseDateTimeComponent implements OnDestroy {
    /**
     * This property sets the display pattern of the time selected
     */
    timepattern: string;

    /**
     * This property sets the output format for the selected time datavalue
     */
    outputformat: string;

    public showdropdownon: string;

    private showseconds: boolean;
    private ismeridian: boolean;
    private deregisterEventListener;

    get timestamp() {
        return this.bsTimeValue ? this.bsTimeValue.valueOf() : undefined;
    }

    get datavalue(): any {
        return getFormattedDate(this.datePipe, this.bsTimeValue, this.outputformat) || '';
    }

    /**Todo[Shubham]: needs to be redefined
     * This property sets the default value for the time selection
     */
    set datavalue(newVal: any) {
        if (newVal) {
            if (newVal === CURRENT_TIME) {
                this.bsTimeValue = getNativeDateObject(newVal);
                this.isCurrentTime = true;
                this.setTimeInterval();
            } else {
                this.clearTimeInterval();
                this.bsTimeValue = getNativeDateObject(newVal);
                this.isCurrentTime = false;
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

    /* Internal property to have a flag to check the given datavalue is of Current time*/
    private isCurrentTime: boolean;

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
    private status = { isopen: false };

    /**
     * This is an internal property used to map the main model to the time widget
     */
    private bsTimeValue: Date;

    private keyEventPlugin;

    constructor(
        inj: Injector,
        private datePipe: ToDatePipe,
        private ngZone: NgZone,
        @Inject(EVENT_MANAGER_PLUGINS) evtMngrPlugins
    ) {
        super(inj, WIDGET_CONFIG);

        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1].constructor;

        styler(this.nativeElement, this);
        /**
         * Destroy the timer once the date widget is gone
         */
        this.registerDestroyListener(() => this.clearTimeInterval());
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'timepattern') {
            this.showseconds = _.includes(nv, 's');
            this.ismeridian = _.includes(nv, 'h');
        }
        if (key === 'mintime') {
            this.minTime = getNativeDateObject(nv); // TODO it is supposed to be time conversion, not to the day
        } else if (key === 'maxtime') {
            this.maxTime = getNativeDateObject(nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    /**
     * This is an internal method used to toggle the dropdown of the time widget
     */
    private toggleDropdown($event): void {
        $event.preventDefault();
        $event.stopPropagation();
        if ($event.target && $($event.target).is('input') && (this.showdropdownon === 'button')) {
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
    }

    private addBodyClickListener(skipListener) {
        if (!skipListener) {
            return;
        }
        const bodyElement = document.querySelector('body');
        setTimeout(() => {
            const dropdownElement = bodyElement.querySelector('.dropdown-menu');
            this.deregisterEventListener = addEventListenerOnElement(bodyElement, dropdownElement, this.nativeElement, 'click', () => {
                this.status.isopen = false;
            }, EVENT_LIFE.ONCE, true);
        }, 350);
    }

    /**
     * This is an internal method triggered when pressing key on the time input
     */
    private onDisplayKeydown(event) {
        const action = this.keyEventPlugin.getEventFullKey(event);
        if (action === 'enter' || action === 'arrowdown') {
            this.toggleDropdown(event);
        }
    }

    /**
     * This is an internal method triggered when the time input changes
     */
    onDisplayTimeChange($event) {
        const newVal = getNativeDateObject($event.target.value);
        this.onTimeChange(newVal);
    }

    /**
     * This is an internal method used to execute the on time change functionality
     */
    private onTimeChange(newVal) {
        if (newVal) {
            this.bsTimeValue = newVal;
        } else {
            this.bsTimeValue = undefined;
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
        if (!_.includes(['blur', 'focus', 'change'], eventName)) {
            super.handleEvent(node, eventName, eventCallback, locals);
        }
    }

    private hideTimepickerDropdown() {
        this.status.isopen = false;
        if (this.deregisterEventListener) {
            this.deregisterEventListener();
        }
        const displayInputElem = this.nativeElement.querySelector('.display-input') as HTMLElement;
        setTimeout(() => displayInputElem.focus());
    }

    /**
     * This is an internal method to add css class for dropdown while opening the time dropdown
     */
    public onShown() {
        const tpElements  = document.querySelectorAll('timepicker');
        _.forEach(tpElements, element => {
            addClass(element.parentElement as HTMLElement, 'app-datetime');
        });
        this.focusTimePickerPopover(this);
        this.bindTimePickerKeyboardEvents();
    }

}
