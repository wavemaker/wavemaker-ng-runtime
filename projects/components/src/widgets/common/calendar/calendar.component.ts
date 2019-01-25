import { DatePickerInnerComponent } from 'ngx-bootstrap/datepicker/datepicker-inner.component';

import { AfterViewInit, AfterContentInit, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';

import { $watch, getClonedObject, getSessionStorageItem, isMobile } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IRedrawableComponent } from '../../framework/types';
import { registerProps } from './calendar.props';
import { getEvaluatedData, provideAsWidgetRef } from '../../../utils/widget-utils';
import { StylableComponent } from '../base/stylable.component';
import { createArrayFrom } from '../../../utils/data-utils';

declare const _, $, moment;

const DEFAULT_CLS = 'app-calendar';
const dateFormats = ['yyyy-MM-dd', 'yyyy-M-dd', 'M-dd-yyyy', 'MM-dd-yy', 'yyyy, dd MMMM', 'yyyy, MMM dd', 'MM/dd/yyyy', 'M/d/yyyy', 'EEE, dd MMM yyyy', 'EEE MMM dd yyyy', 'EEEE, MMMM dd, yyyy', 'timestamp'];
const defaultHeaderOptions = {
    left: 'prev next today',
    center: 'title',
    right: 'month basicWeek basicDay'
};
const VIEW_TYPES = {
    BASIC: 'basic',
    AGENDA: 'agenda',
    LIST: 'list'
};
const BUTTON_TEXT = {
    YEAR: 'Year',
    MONTH: 'Month',
    WEEK: 'Week',
    DAY: 'Day',
    TODAY: 'Today'
};
const SELECTION_MODES = {
    NONE: 'none',
    SINGLE: 'single',
    MULTIPLE: 'multiple'
};
const NEXT_DAY_THRESHOLD = {
    START: '00:00',
    END: '24:00'
};
const getEventMomentValue = (value, key) => {
    let isDate = false;

    dateFormats.forEach((format) => {
        // moment supports uppercase formats
        if (moment(value, format.toUpperCase(), true).isValid()) {
            isDate = true;
            return false;
        }
    });

    // if the value is date then for end date the value should be end of the day as the calendar is approximating it to the start.
    if (isDate && key === 'end') {
        return moment(value).endOf('day');
    }

    return moment(value);
};
const getUTCDateTime = (dateObj) => {
    dateObj = _.isObject(dateObj) ? dateObj : moment(dateObj);
    const year = dateObj.format('YYYY'),
        // javascript starts the month count from '0' where as moment returns the human count
        month = dateObj.format('MM') - 1,
        day = dateObj.format('DD'),
        hours = dateObj.format('HH'),
        minutes = dateObj.format('mm'),
        seconds = dateObj.format('ss');
    return new Date(year, month, day, hours, minutes, seconds);
};
const WIDGET_CONFIG = {widgetType: 'wm-calendar', hostClass: DEFAULT_CLS};
// mobile calendar class names
const multipleEventClass = 'app-calendar-event';
const doubleEventClass = multipleEventClass + ' two';
const singleEventClass = multipleEventClass + ' one';
const dateFormat = 'YYYY/MM/DD';

@Component({
    selector: '[wmCalendar]',
    templateUrl: './calendar.component.html',
    providers: [
        provideAsWidgetRef(CalendarComponent)
    ]
})
export class CalendarComponent extends StylableComponent implements AfterContentInit, AfterViewInit, OnInit, IRedrawableComponent {
    static initializeProps = registerProps();
    // The calendar element reference
    @ViewChild('calendar') _calendar: ElementRef;
    @ViewChild('datepicker') _datepicker: ElementRef;

    public _datepickerInnerComponent: DatePickerInnerComponent;

    public selecteddates: any;
    public selecteddata: any;
    public currentview: object;
    public dataset: any;
    public calendartype;
    public controls = 'navigation, today, year, month, week, day';
    public datavalue;
    public eventtitle;
    public eventstart;
    public eventend;
    public eventallday;
    public eventclass;

    private eventSources: Array<any> = [];

    private dataSetEvents = {
        events: []
    };
    private oldData;
    // map the fullcalendar Element rendered
    private $fullCalendar;
    // model to the mobile calendar
    private proxyModel;
    private eventData;
    private events;
    private changesStack = [];
    private invokeOnViewRenderback = _.debounce(() => this.invokeEventCallback('viewrender', { $view: this.calendarOptions }), 300);

    // calendarOptions to the calendar
    private calendarOptions: any = {
        calendar: {
            height: 600,
            eventSources: this.eventSources,
            editable: true,
            locale: getSessionStorageItem('selectedLocale') || 'en',
            selectable: false,
            header: defaultHeaderOptions,
            nextDayThreshold: NEXT_DAY_THRESHOLD,
            views: {
                month: {
                    eventLimit: 0
                }
            },
            unselectAuto: false,
            eventDrop: this.eventDrop.bind(this),
            eventResizeStart: this.onEventChangeStart.bind(this),
            eventDragStart: this.onEventChangeStart.bind(this),
            eventResize: this.eventResize.bind(this),
            eventClick: this.eventClick.bind(this),
            select: this.select.bind(this),
            eventRender: this.eventRender.bind(this),
            viewRender: this.viewRender.bind(this)
        }
    };
    public mobileCalendar: boolean;
    private view: string;
    private dayClass: Array<any> = [];

    // this function selects the default date given for the calendar
    selectDate() {
        let start, end;
        if (_.isObject(this.datavalue)) {
            start = this.datavalue.start;
            end   = this.datavalue.end;
        } else {
            start = moment(this.datavalue);
            end   = moment(this.datavalue).add(1, 'day').startOf('day');
        }
        this.$fullCalendar.fullCalendar('gotoDate', start); // after selecting the date go to the date.
        this.$fullCalendar.fullCalendar('select', start, end);
    }

    // changes the calendar view to the default date given for the calendar.
    public gotoDate() {
        this.$fullCalendar.fullCalendar('gotoDate', moment(this.datavalue));
    }

    // this function takes the calendar view to the a year ahead
    public gotoNextYear() {
        this.$fullCalendar.fullCalendar('nextYear');
    }

    // this function takes the calendar view to the a year before
    public gotoPrevYear() {
        this.$fullCalendar.fullCalendar('prevYear');
    }

    /**
     * this function takes the calendar view to the specified month
     * @param monthVal, 1-12 value of month
     */
    public gotoMonth(monthVal) {
        const presentDay = this.$fullCalendar.fullCalendar('getDate');
        const presentMonthVal = new Date(presentDay).getMonth();
        if (presentMonthVal < monthVal) {
            this.$fullCalendar.fullCalendar('gotoDate', presentDay.add(monthVal - presentMonthVal - 1, 'M'));
        } else {
            this.$fullCalendar.fullCalendar('gotoDate', presentDay.subtract( presentMonthVal - monthVal + 1, 'M'));
        }
    }

    // this function takes the calendar view to the a month ahead
    public gotoNextMonth() {
        const presentDay = this.$fullCalendar.fullCalendar('getDate');
        this.$fullCalendar.fullCalendar('gotoDate', presentDay.add(1, 'M'));
    }

    // this function takes the calendar view to the a month before
    public gotoPrevMonth() {
        const presentDay = this.$fullCalendar.fullCalendar('getDate');
        this.$fullCalendar.fullCalendar('gotoDate', presentDay.subtract(1, 'M'));
    }


    // this function re-renders the events assigned to the calendar.
    private rerenderEvents() {
        this.$fullCalendar.fullCalendar('rerenderEvents');
    }

    private setSelectedData(start, end) {
        let dataset = this.dataset;
        if (!dataset) {
            return;
        }

        const filteredDates = [];
        const eventStartKey = this.eventstart || 'start';
        const eventEndKey = this.eventend || 'end';
        const startDate = moment(new Date(start)).format('MM/DD/YYYY');
        const endDate = moment(new Date(end)).subtract(1, 'days').format('MM/DD/YYYY');

        dataset = dataset.data || dataset;
        dataset.forEach((value) => {
            if (!value[eventStartKey]) {
                return;
            }
            const eventStartDate   = moment(new Date(value[eventStartKey])).format('MM/DD/YYYY');
            const eventEndDate   = moment(new Date(value[eventEndKey] || value[eventStartKey])).format('MM/DD/YYYY');
            const eventExists = moment(eventStartDate).isSameOrAfter(startDate) && moment(eventEndDate).isSameOrBefore(endDate);
            if (eventExists) {
                filteredDates.push(value);
            }
        });
        return filteredDates;
    }

    private eventDrop($newData, $delta, $revertFunc, $event, $ui, $view) {
        this.invokeEventCallback('eventdrop', {$event, $newData, $oldData: this.oldData, $delta, $revertFunc, $ui, $view});
    }

    private select(start, end, jsEvent, $view) {
        this.selecteddates = {start: getUTCDateTime(start), end: getUTCDateTime(end)};
        this.selecteddata = this.setSelectedData(start, end);
        this.invokeEventCallback('select', {$start: start.valueOf(), $end: end.valueOf(), $view, $data: this.selecteddata});
    }

    private eventResize($newData, $delta, $revertFunc, $event, $ui, $view) {
        this.invokeEventCallback('eventresize', {$event, $newData, $oldData: this.oldData, $delta, $revertFunc, $ui, $view});
    }

    private onEventChangeStart(event) {
        this.oldData = getClonedObject(event);
    }

    private eventClick($data, $event, $view) {
        this.invokeEventCallback('eventclick', {$event, $data, $view});
    }

    private eventRender($data, $event, $view) {
        if (this.calendartype === VIEW_TYPES.LIST) {
            this.$fullCalendar.find('.fc-list-table').addClass('table');
        }
        this.invokeEventCallback('eventrender', {$event, $data, $view});
    }

    private viewRender($view) {
        this.currentview = {start: $view.start.format(), end: $view.end.subtract(1, 'days').format()};
        if (this.calendartype === VIEW_TYPES.LIST) {
            this.$fullCalendar.find('.fc-list-table').addClass('table');
        }
        this.invokeEventCallback('viewrender', {$view});
    }

    // update the calendar header options once the controls changes
    private updateCalendarHeaderOptions() {
        const ctrls = this.controls, viewType = this.calendartype,
            regEx = new RegExp('\\bday\\b', 'g');
        let left = '', right = '';
        if (ctrls && viewType) {
            if (_.includes(ctrls, 'navigation')) {
                left += ' prev next';
            }

            if (_.includes(ctrls, 'today')) {
                left += ' today';
            }

            if (_.includes(ctrls, 'year')) {
                right += (viewType === VIEW_TYPES.LIST) ? 'listYear' : '';
            }

            if (_.includes(ctrls, 'month')) {
                right += (viewType === VIEW_TYPES.LIST) ? ' listMonth' : ' month';
            }

            if (_.includes(ctrls, 'week')) {
                right += (viewType === VIEW_TYPES.BASIC) ?  ' basicWeek' : (viewType === VIEW_TYPES.LIST) ? ' listWeek' : ' agendaWeek';
            }

            if (regEx.test(ctrls)) {
                right += (viewType === VIEW_TYPES.BASIC) ?  ' basicDay' : (viewType === VIEW_TYPES.LIST) ? ' listDay' : ' agendaDay';
            }

            _.extend(this.calendarOptions.calendar.header, {'left': left, 'right': right});
        }
    }

    // to calculate the height for the event limit and parsing the value when it is percentage based.
    private calculateHeight(height): number {
        const $parent = $(this.nativeElement).parent(),
            elHeight = height || '650px';

        let parentHeight = $parent.css('height'),
            computedHeight: number;

        if (_.includes(elHeight, '%')) {
            if (_.includes(parentHeight, '%')) {
                parentHeight = $parent.height();
            }
            computedHeight = (parseInt(parentHeight, 10) * Number(elHeight.replace(/\%/g, ''))) / 100;
        } else {
            computedHeight = parseInt(elHeight, 10);
        }
        this.calendarOptions.calendar.views.month.eventLimit = parseInt('' + computedHeight / 200, 10) + 1;
        return computedHeight;
    }

    private triggerMobileCalendarChange() {
        this.prepareCalendarEvents();
        // change the model so that the view is rendered again with the events , after the dataset is changed.
        this.proxyModel = this.proxyModel || moment().valueOf();
        this.selecteddates = {
            start: moment(this.proxyModel).valueOf(),
            end  : moment(this.proxyModel).endOf('day').valueOf()
        };
        this.invokeEventCallback('eventrender', {$data: this.eventData});
    }

    // prepares events for the mobie calendar
    private prepareCalendarEvents () {
        let eventDay,
            dataset;
        this.eventData = {};
        if (!this.dataset) {
            return;
        }
        dataset = this.dataset;
        dataset = _.isArray(dataset) ? dataset : (_.isObject(dataset) ? [dataset] : []);
        this.events = dataset || this.constructCalendarDataset(dataset);
        this.events.forEach((event) => {
            const eventStart = event.start || event[this.eventstart];
            if (eventStart) {
                eventDay = moment(eventStart).startOf('day').format(dateFormat);
                if (this.eventData[eventDay]) {
                    this.eventData[eventDay].push(event);
                } else {
                    this.eventData[eventDay] = [event];
                }

                if (this.mobileCalendar) {
                    // custom class on the date in the date picker.
                    this.dayClass.push({
                        date: new Date(eventStart).setHours(0, 0, 0, 0),
                        mode: 'day',
                        clazz: this.getDayClass({eventDay: eventDay})
                    });
                }
            }
        });
        // add the eventData on the calendar by calling refreshView
        if (this.mobileCalendar && this._datepickerInnerComponent) {
            this._datepickerInnerComponent.refreshView();
        }
    }

    // constructs the calendar dataset by mapping the eventstart, eventend, eventtitle etc.,
    private constructCalendarDataset(eventSource) {
        const properties = {
            title: this.eventtitle || 'title',
            allday: this.eventallday || 'allday',
            start: this.eventstart || 'start',
            end: this.eventend || 'end',
            className: this.eventclass || 'className'
        };

        eventSource.forEach((obj) => {
            _.mapKeys(properties,  (value, key) => {
                let objVal;
                if (key === 'title') {
                    objVal = getEvaluatedData(obj, {expression: value}, this.viewParent);
                } else {
                    objVal = _.get(obj, value);
                }
                if (!objVal) {
                    return;
                }
                if (key === 'start' || key === 'end') {
                    objVal = getEventMomentValue(objVal, key);
                }
                obj[key] = objVal;
            });
        });
        return eventSource;
    }

    private setLocale() {
        const year = _.get(this.appLocale, 'LABEL_CALENDAR_YEAR') || BUTTON_TEXT.YEAR;
        const month = _.get(this.appLocale, 'LABEL_CALENDAR_MONTH') || BUTTON_TEXT.MONTH;
        const week = _.get(this.appLocale, 'LABEL_CALENDAR_WEEK') || BUTTON_TEXT.WEEK;
        const day = _.get(this.appLocale, 'LABEL_CALENDAR_DAY') || BUTTON_TEXT.DAY;
        const today = _.get(this.appLocale, 'LABEL_CALENDAR_TODAY') || BUTTON_TEXT.TODAY;
        this.calendarOptions.calendar.buttonText    = { year, month, week, day, today,
            'listYear': year,
            'listMonth': month,
            'listWeek': week,
            'listDay': day
        };
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        this.mobileCalendar = isMobile();
        this.eventSources.push(this.dataSetEvents);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER, ['height']);

        if (this.mobileCalendar) {
            if (!this.view || this.view === 'week') {
                this.view = 'day';
            }
            this.triggerMobileCalendarChange();
        } else {
            this.setLocale();
        }
    }

    onStyleChange(key, nv, ov?) {
        super.onStyleChange(key, nv, ov);
        if (key === 'height') {
            this.calendarOptions.calendar.height = this.calculateHeight(nv);
            this.updateCalendarOptions('option', 'height', this.calendarOptions.calendar.height);
        }
    }

    onPropertyChange(key, nv, ov?) {
        super.onPropertyChange(key, nv, ov);
        switch (key) {
            case 'selectionmode':
                if (nv !== SELECTION_MODES.NONE) {
                    this.calendarOptions.calendar.selectable = true;
                    this.updateCalendarOptions('option', 'selectable', true);
                    if (nv === SELECTION_MODES.SINGLE) {
                        this.calendarOptions.calendar.selectConstraint = {
                            start: '00:00',
                            end: '24:00'
                        };
                        this.updateCalendarOptions('option', 'selectConstraint', this.calendarOptions.calendar.selectConstraint);
                    } else {
                        this.updateCalendarOptions('option', 'selectConstraint', {});
                    }
                } else {
                    this.calendarOptions.calendar.selectable = false;
                    this.updateCalendarOptions('option', 'selectable', false);
                }
                break;
            case 'view':
                if (nv !== 'month' || this.calendartype === VIEW_TYPES.LIST) {
                    this.calendarOptions.calendar.defaultView = this.calendartype + _.capitalize(nv);
                } else {
                    this.calendarOptions.calendar.defaultView = nv;
                }
                this.updateCalendarOptions('changeView', this.calendarOptions.calendar.defaultView);
                break;
            case 'calendartype':
                this.calendartype = nv || 'basic';
                this.updateCalendarHeaderOptions();
                break;
            case 'dataset':
                let dataSet;
                this.dataset = nv;
                dataSet = createArrayFrom(getClonedObject(nv));
                dataSet = this.constructCalendarDataset(dataSet);
                this.dataSetEvents.events = dataSet.filter((event) => {
                    event.start = event.start || event.end;
                    if (event.start) {
                        return true;
                    }
                });

                if (this.mobileCalendar) {
                    this.triggerMobileCalendarChange();
                } else {
                    this.updateCalendarOptions('removeEvents');
                    this.updateCalendarOptions('addEventSource', this.dataSetEvents.events);
                    this.updateCalendarOptions('rerenderEvents');
                }
                break;
        }
    }

    // Returns the default date when the datavalue is provided
    getDefaultDate() {
        if (this.datavalue) {
            return new Date(this.datavalue);
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        if (this.mobileCalendar && this._datepicker) {
            let lastActiveDate = (this._datepicker as any).activeDate;
            // renderview when active date changes
            (this._datepicker as any).activeDateChange.subscribe((dt) => {
                const prevYear = lastActiveDate.getYear();
                const prevMonth = lastActiveDate.getMonth();
                const selectedYear = dt.getYear();
                const selectedMonth = dt.getMonth();

                // invoke renderView only when month is changed.
                if (prevMonth !== selectedMonth || prevYear !== selectedYear) {
                    lastActiveDate = dt;
                    this.renderMobileView(dt);
                }
            });

            this._datepickerInnerComponent = (this._datepicker as any)._datePicker;
            this.renderMobileView(moment(this.datavalue));
            this.registerDestroyListener(
                $watch(
                    '_datepickerInnerComponent.datepickerMode',
                    this,
                    {},
                    (nv, ov) => {
                        if (ov && !_.isEmpty(ov)) {
                            this.invokeOnViewRenderback();
                        }
                    }
                )
            );
            return;
        }

        this.$fullCalendar = $(this._calendar.nativeElement);
        this.$fullCalendar.fullCalendar(this.calendarOptions.calendar);
        // if the changes are already stacked before calendar renders then execute them when needed
        if (this.changesStack.length) {
            this.changesStack.forEach((changeObj) => {
                this.$fullCalendar.fullCalendar(changeObj.operationType, changeObj.argumentKey, changeObj.argumentValue);
            });
            this.changesStack.length = 0;
        }
    }

    updateCalendarOptions(operationType: string, argumentKey?: any, argumentValue?: any): void {
        if (!this.$fullCalendar) {
            this.changesStack.push({
                operationType: operationType,
                argumentKey: argumentKey,
                argumentValue: argumentValue
            });
            return;
        }
        this.$fullCalendar.fullCalendar(operationType, argumentKey, argumentValue);
    }

    redraw() {
        this.updateCalendarOptions('render');
    }

    // on date change invoke the select event, and if date has event on it then invoke the event click.
    private onValueChange(value: Date): void {
        this.proxyModel = value;
        const selectedDate        = this.proxyModel && moment(this.proxyModel).startOf('day').format(dateFormat),
            selectedEventData   = this.eventData[selectedDate],
            start               = moment(this.proxyModel),
            end                 = moment(this.proxyModel).endOf('day');
        this.selecteddata = selectedEventData;
        this.selecteddates = {
            'start': moment(selectedDate).valueOf(),
            'end'  : moment(selectedDate).endOf('day').valueOf()
        };
        this.calendarOptions.calendar.select(start.valueOf(), end.valueOf(), {}, this, selectedEventData);
        if (selectedEventData) {
            this.calendarOptions.calendar.eventClick(selectedEventData, {}, this);
        }
    }

    // returns the custom class for the events depending on the length of the events for that day.
    private getDayClass(data) {
        const eventDay = data.eventDay;

        if (!_.isEmpty(this.eventData) && this.eventData[eventDay]) {
            const eventsLength = this.eventData[eventDay].length;
            if (eventsLength === 1) {
                return singleEventClass;
            }
            if (eventsLength === 2) {
                return doubleEventClass;
            }
            return multipleEventClass;
        }
        return '';
    }

    // sets the current view and invokes the viewrender method.
    private renderMobileView(viewObj) {
        let startDate,
            endDate;
        if (!viewObj) {
            return;
        }
        startDate = moment(viewObj).startOf('month').valueOf();
        endDate = moment(viewObj).endOf('month').valueOf();
        this.currentview = {start: startDate, end: endDate};
        this.invokeOnViewRenderback();
    }
}
