import { AfterViewInit, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';

import { getClonedObject, getSessionStorageItem } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IRedrawableComponent } from '../../framework/types';
import { registerProps } from './calendar.props';
import { getEvaluatedData, provideAsWidgetRef } from '../../../utils/widget-utils';
import { StylableComponent } from '../base/stylable.component';

declare const _, $, moment;
registerProps();

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
const SELECTION_MODES = {
    NONE: 'none',
    SINGLE: 'single',
    MULTIPLE: 'multiple'
};
const BUTTON_TEXT = {
    DAY: 'Day',
    MONTH: 'Month',
    YEAR: 'Year',
    WEEK: 'Week',
    TODAY: 'Today'
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

@Component({
    selector: '[wmCalendar]',
    templateUrl: './calendar.component.html',
    providers: [
        provideAsWidgetRef(CalendarComponent)
    ]
})
export class CalendarComponent extends StylableComponent implements AfterViewInit, OnInit, IRedrawableComponent {
    // The calendar element reference
    @ViewChild('calendar') _calendar: ElementRef;

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

    private eventSources = {
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

    // calendarOptions to the calendar
    private calendarOptions: any = {
        calendar: {
            height: 600,
            eventSources: this.eventSources,
            editable: true,
            locale: getSessionStorageItem('selectedLocale') || 'en',
            selectable: false,
            header: defaultHeaderOptions,
            buttonText: {
                month: BUTTON_TEXT.MONTH,
                week : BUTTON_TEXT.WEEK,
                day  : BUTTON_TEXT.DAY,
                year : BUTTON_TEXT.YEAR,
                today: BUTTON_TEXT.TODAY
            },
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
    gotoDate() {
        this.$fullCalendar.fullCalendar('gotoDate', moment(this.datavalue));
    }

    // this function takes the calendar view to the a year ahead or before based on the operation
    gotoYear(operation) {
        let navigateTo;
        if (operation === 'next') {
            navigateTo = 'nextYear';
        } else {
            navigateTo = 'prevYear';
        }
        this.$fullCalendar.fullCalendar(navigateTo);
    }

    // this function re-renders the events assigned to the calendar.
    rerenderEvents() {
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
        this.invokeEventCallback('select', {$start: start.valueOf(), $end: end.valueOf(), $view});
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
            if (event.start) {
                eventDay = moment(event.start).startOf('day').format('YYYY/MM/DD');
                if (this.eventData[eventDay]) {
                    this.eventData[eventDay].push(event);
                } else {
                    this.eventData[eventDay] = [event];
                }
            }
        });
    }

    // constructs the calendar dataset by mapping the eventstart, eventend, eventtitle etc.,
    private constructCalendarDataset(eventSource) {
        const properties = {
            title: this.eventtitle,
            allday: this.eventallday,
            start: this.eventstart,
            end: this.eventend,
            className: this.eventclass
        };

        eventSource.forEach((obj) => {
            _.mapKeys(properties,  (value, key) => {
                let objVal;
                if (key === 'title') {
                    objVal = getEvaluatedData(obj, {expression: value});
                } else {
                    objVal = _.get(obj, key);
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

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER, ['height']);
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
                }
                break;
            case 'view':
                if (nv !== 'month' || this.calendartype === VIEW_TYPES.LIST) {
                    this.calendarOptions.calendar.defaultView = this.calendartype + _.capitalize(nv);
                } else {
                    this.calendarOptions.calendar.defaultView = nv;
                }
                this.updateCalendarOptions('changeView', this.calendarOptions.calendar.defaultView);
            // mobile newVal === 'week' defaultView = 'day'
                break;
            case 'calendartype':
                this.calendartype = nv || 'basic';
                this.updateCalendarHeaderOptions();
                break;
            case 'dataset':
                let dataSet;
                const eventSet = [];
                // triggerCalendarChange(); -> Mobile related
                delete this.eventSources.events;
                this.dataset = nv;
                dataSet = getClonedObject(nv);
                dataSet = _.isArray(dataSet) ? dataSet : _.isObject(dataSet) ? [dataSet] : [];
                dataSet = this.constructCalendarDataset(dataSet);
                if (_.includes(_.keys(dataSet[0]), 'start')) {
                    dataSet.forEach((event) => {
                        event.start = event.start || event.end;
                        if (event.start) {
                            eventSet.push(event);
                        }
                    });
                    this.eventSources.events = eventSet;
                }
                if (this.$fullCalendar) {
                    this.updateCalendarOptions('removeEvents');
                    this.updateCalendarOptions('addEventSource', eventSet);
                    this.updateCalendarOptions('rerenderEvents');
                }
                break;
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
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
}
