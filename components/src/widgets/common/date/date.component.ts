import { Component, Injector } from '@angular/core';

import { getDateObj, getFormattedDate } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './date.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
import { BsDatepickerConfig } from 'ngx-bootstrap';

registerProps();

const DEFAULT_CLS = 'app-date input-group';
const WIDGET_CONFIG = {widgetType: 'wm-date', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmDate]',
    templateUrl: './date.component.html',
    providers: [
        provideAsNgValueAccessor(DateComponent),
        provideAsWidgetRef(DateComponent)
    ]
})
export class DateComponent extends BaseFormCustomComponent {
    private outputFormat;
    /**
     * This is an internal property used to map the containerClass, showWeekNumbers etc., to the bsDatepicker
     */
    private _dateOptions: BsDatepickerConfig = new BsDatepickerConfig();

    private isCurrentDate;

    bsDataValue;

    get displayValue() {
        return getFormattedDate(this.datePipe, this.bsDataValue, this._dateOptions.dateInputFormat) || '';
    }

    get datavalue () {
        return getFormattedDate(this.datePipe, this.bsDataValue, this.outputFormat) || '';
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

    // TODO use BsLocaleService to set the current user's locale to see the localized labels
    constructor(inj: Injector, public datePipe: ToDatePipe) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        this._dateOptions.containerClass = 'theme-red';
        this._dateOptions.showWeekNumbers = false;
    }

    onPropertyChange(key, newVal, ov?) {
        switch (key) {
            case 'datepattern':
                this._dateOptions.dateInputFormat = newVal;
                break;
            case 'outputformat':
                this.outputFormat = newVal;
                break;
            case 'showweeks':
                this._dateOptions.showWeekNumbers = newVal;
                break;
            case 'mindate':
                this._dateOptions.minDate = getDateObj(newVal);
                break;
            case 'maxdate':
                this._dateOptions.maxDate = getDateObj(newVal);
                break;
        }
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

    // sets the dataValue and computes the display model values
    private setDataValue(newVal): void {
        if (newVal) {
            this.bsDataValue = newVal;
        } else {
            this.bsDataValue = undefined;
        }
        this.invokeOnChange(this.datavalue, {}, true);
    }
}
