import { AfterViewInit, OnDestroy } from '@angular/core';
import { getDateObj, isString } from '@wm/core';
import { BaseFormCustomComponent } from './base-form-custom.component';
import { Subscription } from 'rxjs/Subscription';
import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap';

declare const moment, _, $;

export abstract class BaseDateTimeComponent extends BaseFormCustomComponent implements AfterViewInit, OnDestroy {
    public excludedays: string;
    public excludedates;
    public outputformat;

    private dateOnShowSubscription: Subscription;

    /**
     * This is an internal property used to map the containerClass, showWeekNumbers etc., to the bsDatepicker
     */
    protected _dateOptions: BsDatepickerConfig = new BsDatepickerConfig();
    protected bsDatePickerDirective: BsDatepickerDirective;

    onPropertyChange(key, nv, ov?) {

        if (key === 'tabindex') {
            return;
        }

        if (key === 'datepattern') {
            this._dateOptions.dateInputFormat = nv;
        } else if (key === 'showweeks') {
            this._dateOptions.showWeekNumbers = nv;
        } else if (key === 'mindate') {
            this._dateOptions.minDate = getDateObj(nv);
        } else if (key === 'maxdate') {
            this._dateOptions.maxDate = getDateObj(nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.bsDatePickerDirective) {
            this.dateOnShowSubscription = this.bsDatePickerDirective
                .onShown
                .subscribe(cal => {
                    cal.daysCalendar.subscribe(data => {
                        let excludedDates;
                        if (this.excludedates) {
                            if (isString(this.excludedates)) {
                                excludedDates = _.split(this.excludedates, ',');
                            } else {
                                excludedDates = this.excludedates;
                            }
                            excludedDates = excludedDates.map(d => moment(d));
                        }
                        data[0].weeks.forEach(week => {
                            week.days.forEach(day => {
                                if (!day.isDisabled && this.excludedays) {
                                    day.isDisabled = _.includes(this.excludedays, day.dayIndex);
                                }

                                if (!day.isDisabled && excludedDates) {
                                    const md = moment(day.date);
                                    day.isDisabled = excludedDates.some(ed => md.isSame(ed, 'day'));
                                }
                            });
                        });
                    });
                });
        }

    }

    ngOnDestroy() {
        if (this.dateOnShowSubscription) {
            this.dateOnShowSubscription.unsubscribe();
        }

        super.ngOnDestroy();
    }
}