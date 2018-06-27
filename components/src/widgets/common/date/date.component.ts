import { Component, Injector, ViewChild } from '@angular/core';

import { BsDatepickerDirective } from 'ngx-bootstrap';

import { getDateObj, getFormattedDate } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './date.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { BaseDateTimeComponent } from '../base/base-date-time.component';

registerProps();

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
        provideAsWidgetRef(DateComponent)
    ]
})
export class DateComponent extends BaseDateTimeComponent {
    private bsDataValue;

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
        if (newVal) {
            this.bsDataValue = getDateObj(newVal);
        } else {
            this.bsDataValue = undefined;
        }
        this.invokeOnChange(this.datavalue);
    }

    @ViewChild(BsDatepickerDirective) protected bsDatePickerDirective;

    // TODO use BsLocaleService to set the current user's locale to see the localized labels
    constructor(inj: Injector, public datePipe: ToDatePipe) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        this._dateOptions.containerClass = 'theme-red';
        this._dateOptions.showWeekNumbers = false;
    }

    /**
     * This is an internal method triggered when the date input changes
     */
    onDisplayDateChange($event) {
        const newVal = getDateObj($event.target.value);
        this.setDataValue(newVal);
    }

    // sets the dataValue and computes the display model values
    private setDataValue(newVal): void {
        if (newVal) {
            this.bsDataValue = newVal;
        } else {
            this.bsDataValue = undefined;
        }
        this.invokeOnChange(this.datavalue, {}, true);
    }

    onDatePickerOpen() {
        this.invokeOnTouched();
    }

    /**
     * This is an internal method triggered when the date selection changes
     */
    onDateChange(newVal): void {
        this.setDataValue(newVal);
    }
}
