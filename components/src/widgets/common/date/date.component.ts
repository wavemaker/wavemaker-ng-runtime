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

    bsDataValue;

    get displayValue() {
        return getFormattedDate(this.datePipe, this.bsDataValue, this._dateOptions.dateInputFormat) || '';
    }

    // TODO use BsLocaleService to set the current user's locale to see the localized labels
    constructor(inj: Injector, public datePipe: ToDatePipe) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        this._dateOptions.containerClass = 'theme-red';
    }

    onPropertyChange(key, newVal, ov?) {
        switch (key) {
            case 'datepattern':
                this._dateOptions.dateInputFormat = newVal;
                this.setDataValue(this.bsDataValue);
                break;
            case 'outputformat':
                this.outputFormat = newVal;
                this.setDataValue(this.bsDataValue);
                break;
            /*case 'datavalue': // Todo: Should reverse format be applied
                this.setDataValue(newVal);
                break;*/
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
        this.invokeEventCallback('change', {$event: newVal, newVal, oldVal: this.datavalue});
    }

    // sets the dataValue and computes the display model values
    private setDataValue(newVal): void {
        if (newVal) {
            this.bsDataValue = newVal;
        } else {
            this.bsDataValue = undefined;
        }
        this.invokeOnChange(this.datavalue);
    }

    get datavalue () {
        return getFormattedDate(this.datePipe, this.bsDataValue, this.outputFormat) || '';
    }
    // sets the dataValue and computes the display model values
    set datavalue(newVal) {
        // TODO this impl should set the bsDatavalue by applying the reverse output format...
        if (newVal) {
            this.bsDataValue = newVal;
        } else {
            this.bsDataValue = undefined;
        }
        this.invokeOnChange(this.datavalue);
    }
}
