import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Injector, Input, NgZone, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalService } from 'ngx-bootstrap/modal';

import { App } from '@wm/core';

declare const moment, $, _;

@Component({
    selector: 'wm-datetimepicker',
    template: ` 
    <ng-template #datetimepickerTemplate>
        <div class="app-datetime-picker">
            <div class="modal-body">
                <div class="mobile-datetime-picker-options">
                    
                </div>
                <bs-datepicker-inline
                    [bsConfig]="bsDatepickerConfig"
                    [datesDisabled]="excludedDatesToDisable"
                    bsDatepicker
                    [bsValue]="changedValue"
                    (bsValueChange)="onDateUpdate($event)"
                    *ngIf="mode === 'DATE_TIME' || mode === 'DATE'">
                </bs-datepicker-inline>
                <wm-timepicker
                    [value]="changedValue"
                    [min]="minTime"
                    [max]="maxTime"
                    (change)="onDateUpdate($event)"
                    *ngIf="mode === 'DATE_TIME' || mode === 'TIME'"></wm-timepicker>
            </div>
            <div class="modal-footer">
                <span class="text-primary date-picker-value">
                    {{getDateLabel()}}
                </span>
                <button
                    class="btn btn-secondary"
                    (click)="hideModal()">{{appLocale.MESSAGE_DATE_PICKER_CANCEL || "Cancel" }}</button>
                <button
                    class="btn btn-primary"
                    (click)="onOkClick()">{{appLocale.MESSAGE_DATE_PICKER_OK || "Ok" }}</button>
            </div>
        </div>
    </ng-template>
    `
})
export class DateTimePickerComponent implements AfterViewInit {

    private isDateOpen = true;

    private isTimeOpen = false;

    private appLocale: any;

    @ViewChild('datetimepickerTemplate' , { static: true }) datetimepickerTemplate: TemplateRef<any>;

    @Input()
    private mode: 'DATE' | 'TIME' | 'DATE_TIME' = 'DATE_TIME';

    @Input()
    private placement: 'MODAL' | 'INLINE' = 'MODAL';

    @Input("config")
    private _bsDatepickerConfig: BsDatepickerConfig;

    @Input()
    private minTime: Date;

    @Input()
    private maxTime: Date;

    @Output() change = new EventEmitter<Date>();

    private _value = new Date();

    private changedValue = null;

    @Input()
    private excludedDatesToDisable;

    constructor(
        protected inj: Injector,
        private bsModalService: BsModalService) {
        this.appLocale = inj.get(App).appLocale || {};
    }

    @Input()
    set value(d: Date) {
        this._value = d;
        this.changedValue = d;
    }

    
    @Input("config")
    set bsDatepickerConfig(config: BsDatepickerConfig) {
        this._bsDatepickerConfig = config;
        this._bsDatepickerConfig.showClearButton = false;
        this._bsDatepickerConfig.showTodayButton = false;
    }

    @Input()
    set excludedDaysToDisable(v: number[]) {
        this._bsDatepickerConfig.daysDisabled = v;
    }

    get bsDatepickerConfig() {
        return this._bsDatepickerConfig;
    }

    getDateLabel() {
        if (this.mode === 'DATE_TIME') {
            return moment(this.changedValue).format('DD MMM, YYYY HH:mm:ss');
        }
        if (this.mode === 'DATE') {
            return moment(this.changedValue).format('DD MMM, YYYY');
        }
        if (this.mode === 'TIME') {
            return moment(this.changedValue).format('HH:mm:ss');
        }
    }

    openDatePicker() {
        this.isTimeOpen = false;
        this.isDateOpen = true;
    }

    openTimePicker() {
        this.isTimeOpen = true;
        this.isDateOpen = false;
    }

    public onDateUpdate(newVal) {
        this.changedValue = newVal;
    }

    show() {
        this.bsModalService.show(this.datetimepickerTemplate, {
            animated: true,
            backdrop: true,
            class: 'date-picker-modal modal-dialog-centered',
        });
    }

    hideModal() {
        this.bsModalService.hide();
    }

    onCancelClick() {
        this.changedValue = this._value;
        this.hideModal();
    }

    onOkClick() {
        this.triggerChange();
        this.hideModal();
    }

    triggerChange() {
        if (this.changedValue !== null
            && this.value !== this.changedValue) {
            this.change.emit(this.changedValue);
        }
    }

    ngAfterViewInit(): void {
        
    }

}


@Component({
    selector: 'wm-timepicker',
    template: ` 
        <wm-pickergroup>
            <wm-picker 
                [options]="options.hour"
                [selectedValue]="hour"
                (change)="set($event, 'HOUR')"></wm-picker>
            <span class="app-time-separator">:</span>
            <wm-picker 
                [options]="options.minute"
                [selectedValue]="minute"
                (change)="set($event, 'MINUTE')"></wm-picker>
            <span class="app-time-separator">:</span>
            <wm-picker 
                [options]="options.minute"
                [selectedValue]="second"
                (change)="set($event, 'SECOND')"></wm-picker>
        </wm-pickergroup>
    `
})
export class TimePickerComponent implements AfterViewInit {

    options = {
        hour: [],
        minute: [],
        second: [],
        meridian: ['AM', 'PM']
    };

    @Input()
    private value = new Date();

    @Input()
    private min: Date = null;

    @Input()
    private max: Date = null;

    @Output() change = new EventEmitter<Date>();

    constructor(
        protected inj: Injector) {
        this.options.hour = this.populateNumbers(0, 23);
        this.options.minute = this.populateNumbers(0, 59);
        this.options.second = this.populateNumbers(0, 59);
    }

    private populateNumbers(start: number, to: number) {
        const arr = [];
        for(let i = start; i <= to; i++) {
            arr.push({
                label: (i < 10 ? '0' : '') + i,
                value: i
            })
        }
        return arr;
    }

    set({index, value}, unit: 'HOUR' | 'MINUTE' | 'SECOND' | 'MERIDIAN') {
        if (unit === 'HOUR') {
            this.value = moment(this.value).hour(parseInt(value)).toDate();
        } else if (unit === 'MINUTE') {
            this.value = moment(this.value).minute(parseInt(value)).toDate();
        } else if (unit === 'SECOND') {
            this.value = moment(this.value).second(parseInt(value)).toDate();
        } else if (unit === 'MERIDIAN') {
            this.value = moment(this.value).minute(value).toDate();
        }
        if (this.min && this.value < this.min) {
            this.value = this.min;
        }
        if (this.max && this.value > this.max) {
            this.value = this.max;
        }
        this.change.emit(this.value);
    }

    get hour() {
        return moment(this.value).hour();
    }

    get minute() {
        return moment(this.value).minute();
    }

    get second() {
        return moment(this.value).second();
    }

    get meridian() {
        return 'AM';
    }

    public onDateUpdate(newVal) {
        debugger;
    }

    ngAfterViewInit(): void {
        
    }

}