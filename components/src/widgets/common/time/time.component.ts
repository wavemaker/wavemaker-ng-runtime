import { Component, Injector, OnDestroy } from '@angular/core';

import { $appDigest, addClass, addEventListener, EVENT_LIFE, getFormattedDate, getValidDateObject, setAttr } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './time.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';

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
export class TimeComponent extends BaseFormCustomComponent implements OnDestroy {
    /**
     * This property sets the display pattern of the time selected
     */
    timepattern: string;

    /**
     * This property sets the output format for the selected time datavalue
     */
    outputformat: string;
    private showseconds: boolean;

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
                this.bsTimeValue = getValidDateObject(newVal);
                this.isCurrentTime = true;
                this.setTimeInterval();
            } else {
                this.clearTimeInterval();
                this.bsTimeValue = getValidDateObject(newVal);
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

    constructor(inj: Injector, public datePipe: ToDatePipe) {
        super(inj, WIDGET_CONFIG);

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
        if (key === 'autofocus' && nv) {
            const inputElement  = this.$element.find('.display-input')[0] as HTMLElement;
            setAttr(inputElement, key, nv);
        }
        if (key === 'timepattern') {
            this.showseconds = _.includes(nv, 'ss');
        }
        if (key === 'mintime') {
            this.minTime = getValidDateObject(nv); // TODO it is supposed to be time conversion, not to the day
        } else if (key === 'maxtime') {
            this.maxTime = getValidDateObject(nv);
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
     * This is an internal method triggered when the time input changes
     */
    onDisplayTimeChange($event) {
        const newVal = getValidDateObject($event.target.value);
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
     * This is an internal method to add css class for dropdown while opening the time dropdown
     */
    public onShown() {
        const tpElements  = document.querySelectorAll('timepicker');
        _.forEach(tpElements, (element) => {
            addClass(element.parentElement as HTMLElement, 'app-datetime');
        });
    }

}
