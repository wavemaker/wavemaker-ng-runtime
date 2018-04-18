import { Component, forwardRef, Injector } from '@angular/core';

import { getFormattedDate } from '@wm/core';

import { styler } from '../../framework/styler';
import { BaseFormComponent } from '../base/base-form.component';
import { registerProps } from './date.props';
import { getControlValueAccessor, invokeEventHandler } from '../../../utils/widget-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';

registerProps();

const DEFAULT_CLS = 'app-date input-group';
const WIDGET_CONFIG = {widgetType: 'wm-date', hostClass: DEFAULT_CLS};

const now: Date = new Date();
const CURRENT_DATE: string = 'CURRENT_DATE';
/**
 * method to get the date object from the input received
 */
const getDateObj = (value?: string): Date => {
    const dateObj = new Date(value);
    if (value === CURRENT_DATE || isNaN(dateObj.getDay())) {
        return now;
    }
    return dateObj;
};

@Component({
    selector: '[wmDate]',
    templateUrl: './date.component.html',
    providers: [getControlValueAccessor(DateComponent), {
        provide: '@Widget', useExisting: forwardRef(() => DateComponent)
    }]
})
export class DateComponent extends BaseFormComponent {
    /**
     * This is an internal property used to map it to the widget
     */
    private minDate: Date;
    /**
     * This is an internal property used to map it to the widget
     */
    private maxDate: Date;
    /**
     * This is an internal property used to map the main model to the bsDatewidget
     */
    private proxyModel: any;
    /**
     * This is an internal property used to map the formattedModel to the date display
     */
    private formattedModel: string = '';

    private datePattern;

    private outputFormat;

    datavalue;
    disabled;
    readonly;
    _datavalue;

    /**
     * This is an internal property used to map the containerClass, showWeekNumbers etc., to the bsDatepicker
     */
    private _dateOptions: any = {
        'containerClass': 'theme-red'
    };

    onDatePickerOpen() {
        this.invokeOnTouched();
    }
    /**
     * This is an internal method triggered when the date selection changes
     */
    onDateChange(newVal): void {
        invokeEventHandler(this, 'change', {$event: newVal, newVal, oldVal: this.datavalue});
        this.proxyModel = newVal;
        if (newVal) {
            this.formattedModel = getFormattedDate(this.datePipe, newVal, this.datePattern) || '';
            this.datavalue = getFormattedDate(this.datePipe, this.proxyModel, this.outputFormat);
        } else {
            this.formattedModel = '';
            this.datavalue = undefined;
        }
        this.invokeOnChange(this.datavalue);
    }

    // sets the dataValue and computes the display model values
    private setDataValue(newVal): void {
        if (newVal) {
            this._datavalue = newVal;
            this.proxyModel = getDateObj(newVal);
            this.formattedModel = getFormattedDate(this.datePipe, this.proxyModel, this.datePattern) || '';
            this.datavalue = getFormattedDate(this.datePipe, this.proxyModel, this.outputFormat);
        } else {
            this.formattedModel = '';
            this._datavalue = this.proxyModel = this.datavalue = undefined;
        }
        this.invokeOnChange(this.datavalue);
    }

    get isDisabled(): boolean {
        return this.disabled || this.readonly;
    }

    onPropertyChange(key, newVal, ov?) {
        switch (key) {
            case 'datepattern':
                this.datePattern = newVal;
                this.setDataValue(this._datavalue);
                break;
            case 'outputformat':
                this.outputFormat = newVal;
                this.setDataValue(this._datavalue);
                break;
            case 'datavalue':
                this.setDataValue(newVal);
                break;
            case 'showweeks':
                this._dateOptions.showWeekNumbers = newVal;
                break;
            case 'mindate':
                this.minDate = getDateObj(newVal);
                break;
            case 'maxdate':
                this.maxDate = getDateObj(newVal);
                break;
        }
    }

    constructor(inj: Injector, public datePipe: ToDatePipe) {
        super(inj, WIDGET_CONFIG);
        styler(this.$element, this);
    }
}
