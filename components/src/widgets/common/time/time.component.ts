import { Component, forwardRef, Injector, OnDestroy } from '@angular/core';

import { $appDigest, addEventListener, EVENT_LIFE, getFormattedDate } from '@wm/core';

import { WidgetRef } from '../../framework/types';
import { styler } from '../../framework/styler';
import { BaseFormComponent } from '../base/base-form.component';
import { registerProps } from './time.props';
import { getControlValueAccessor } from '../../../utils/widget-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';

const CURRENT_TIME: string = 'CURRENT_TIME';
const DEFAULT_CLS = 'input-group app-timeinput';
const WIDGET_CONFIG = {widgetType: 'wm-time', hostClass: DEFAULT_CLS};

registerProps();
/**
 * The time component
 * Represents Time widget with hourstep, minutestep, outputformat, timepattern etc properties.
 * Example of usage:
 * <example-url>http://localhost:4200/time</example-url>
 *
 */
@Component({
    selector: '[wmTime]',
    templateUrl: './time.component.html',
    providers: [
        getControlValueAccessor(TimeComponent),
        {provide: WidgetRef, useExisting: forwardRef(() => TimeComponent)}
    ]
})
export class TimeComponent extends BaseFormComponent implements OnDestroy {
    /**
     * This property sets the widget to readonly mode
     */
    readonly: boolean;
    /**
     * This property sets the widget to disabled mode
     */
    disabled: boolean;

    get isDisabled() {
        return this.readonly || this.disabled || this.isCurrentTime;
    }
    /**
     * This property sets the display pattern of the time selected
     */
    timepattern: string;
    /**
     * This property sets the output format for the selected time datavalue
     */
    outputformat: string;

    get datavalue(): any {
        return getFormattedDate(this.datePipe, this.proxyModel, this.outputformat);
    }
    /**
     * This property sets the default value for the time selection
     */
    set datavalue(newVal: any) {
        if (newVal) {
            if (newVal === CURRENT_TIME) {
                this.proxyModel = this.getDateObj();
                this.isCurrentTime = true;
                this.setTimeInterval();
            } else {
                this.clearTimeInterval();
                this.proxyModel = this.getDateObj(newVal);
                this.isCurrentTime = false;
            }
            if (this.timepattern) {
                this.formattedModel = getFormattedDate(this.datePipe, this.proxyModel, this.timepattern) || '';
            }
            this.timestamp = this.proxyModel.valueOf();
        } else {
            this.formattedModel = '';
            this.proxyModel = this.timestamp = undefined;
            this.clearTimeInterval();
            this.isCurrentTime = false;
        }
        this.invokeOnChange(this.datavalue);
        $appDigest();
    }

    timestamp: number;
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
     * This is an internal property used to map the timepattern on the widget
     */
    private formattedModel = '';
    /**
     * This is an internal property used to toggle the timepicker dropdown
     */
    private status = { isopen: false };
    /**
     * This is an internal property used to map the main model to the time widget
     */
    private proxyModel: Date;

    constructor(inj: Injector, public datePipe: ToDatePipe) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
        /**
         * Destroy the timer once the date widget is gone
         */
        this.registerDestroyListener(() => this.clearTimeInterval());
    }
    /**
     * This is an internal method used to toggle the dropdown of the time widget
     */
    private toggleDropdown($event): void {
        $event.preventDefault();
        $event.stopPropagation();
        this.status.isopen = !this.status.isopen;
        this.addBodyClickListener(this.status.isopen);
    }

    private addBodyClickListener(skipListener) {
        if (!skipListener) {
            return;
        }
        const bodyElement = document.querySelector('body');
        const evt = new Event('click');
        setTimeout(() => {
            const dropdownElement = this.nativeElement.querySelector('.dropdown-menu');
            addEventListener(bodyElement, dropdownElement, 'click', () => {
                this.toggleDropdown(evt);
            }, EVENT_LIFE.ONCE);
        }, 350);
    }

    /**
     * This is an internal method used to execute the on time change functionality
     */
    private onTimeChange(newVal) {
        this.invokeEventCallback('change', {newVal, oldVal: this.proxyModel});
        if (newVal) {
            this.proxyModel = newVal;
            this.formattedModel = getFormattedDate(this.datePipe, newVal, this.timepattern) || '';
            this.timestamp = this.proxyModel.valueOf();
        } else {
            this.formattedModel = '';
            this.proxyModel = this.timestamp = undefined;
        }
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
    }
    /**
     * This is an internal method to get the date object from the input received
     */
    private getDateObj(value?: string): Date {
        const dateObj = new Date(value);
        if (value === CURRENT_TIME || isNaN(dateObj.getDay())) {
            return new Date();
        }
        return dateObj;
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
            this.onTimeChange(now);
            this.datavalue = CURRENT_TIME;
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

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'mintime':
                this.minTime = this.getDateObj(newVal);
                break;
            case 'maxtime':
                this.maxTime = this.getDateObj(newVal);
                break;
        }
    }

}
