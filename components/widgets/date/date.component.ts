import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Output } from '@angular/core';
import { getFormattedDate } from '@utils/utils';
import { BaseComponent } from '../../widgets/base/base.component';
import { registerProps } from './date.props';
import { styler } from '../../utils/styler';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-date', hasTemplate: true};
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
    selector: 'wm-date',
    templateUrl: './date.component.html'
})
export class DateComponent extends BaseComponent {
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
    private formattedModel: string;

    private datePattern;

    private outputFormat;

    datavalue;
    disabled;
    readonly;
    _datavalue;

    @Output() change: EventEmitter<any> = new EventEmitter();

    /**
     * This is an internal property used to map the containerClass, showWeekNumbers etc., to the bsDatepicker
     */
    private _dateOptions: any = {
        'containerClass': 'theme-red'
    };

    /**
     * This is an internal method triggered when the date selection changes
     */
    onDateChange(newVal): void {
        this.change.emit({$event: newVal, $isolateScope: this, newVal, oldVal: this.datavalue});
        this.proxyModel = newVal;
        this.formattedModel = getFormattedDate(newVal, this.datePattern);
        this.datavalue = getFormattedDate(this.proxyModel, this.outputFormat);
    }

    // sets the dataValue and computes the display model values
    private setDataValue(newVal): void {
        this._datavalue = newVal;
        this.proxyModel = getDateObj(newVal);
        this.formattedModel = getFormattedDate(this.proxyModel, this.datePattern);
        this.datavalue = getFormattedDate(this.proxyModel, this.outputFormat);
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

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    _ngOnInit() {
        styler(this.$element, this);
    }
}
