import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { registerProps } from './calendar.props';
import { getClonedObject } from '@utils/utils';
import { getEvaluatedData } from '../../utils/widget-utils';
import { invokeEventHandler } from '../../utils/widget-utils';

declare const _, $, moment;

const DEFAULT_CLS = 'app-calendar';
const WIDGET_CONFIG = {widgetType: 'wm-calendar', hostClass: DEFAULT_CLS};
/**
 * property to store the dateFormats
 */
const dateFormats = ['yyyy-MM-dd', 'yyyy-M-dd', 'M-dd-yyyy', 'MM-dd-yy', 'yyyy, dd MMMM', 'yyyy, MMM dd', 'MM/dd/yyyy', 'M/d/yyyy', 'EEE, dd MMM yyyy', 'EEE MMM dd yyyy', 'EEEE, MMMM dd, yyyy', 'timestamp'];
/**
 * property to map the default header options to the calendar
 */
const defaultHeaderOptions = {
    left: 'prev next today',
    center: 'title',
    right: 'month basicWeek basicDay'
};
/**
 * property to map the control options to the calendar
 */
const CONTROL_OPTIONS = {
    LIST: 'navigation, today, year, month, week, day',
    OTHERS: 'navigation, today, month, week, day'
};
/**
 * property to map the view types to the calendar
 */
const VIEW_TYPES = {
    BASIC: 'basic',
    AGENDA: 'agenda',
    LIST: 'list'
};
/**
 * property to map the selection mode to the calendar
 */
const SELECTION_MODES = {
    NONE: 'none',
    SINGLE: 'single',
    MULTIPLE: 'multiple'
};
/**
 * property to map the ButtonText to the calendar
 */
const  BUTTON_TEXT = {
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

registerProps();

@Component({
    selector: '[wmCalendar]',
    templateUrl: './calendar.component.html'
})
export class CalendarComponent extends BaseComponent implements AfterViewInit, OnInit {
    /**
     * The calendar element reference
     */
    @ViewChild('calendar') _calendar: ElementRef;
    /**
     * The selected dates of the widget
     */
    selecteddates: any;
    /**
     * The selected events data of the calendar widget
     */
    selecteddata: any;

    /**
     * The current view object of the calendar widget includes start, end and other props
     */
    currentview: object;
    /**
     * private property to map the dataset input
     */
    dataset: any;
    /**
     * The calendar type of the widget it can hold three values basic, agenda, list
     */

    calendartype;
    /**
     * The controls property will enable the navigation and view related buttons on the top left and right side of the widget
     */
    controls = 'navigation, today, year, month, week, day';

    /**
     * The datavalue property is used to select a day, gotoYear, gotoDate etc.,
     */
    datavalue;
    /**
     * The title property to map from the given dataset
     */
    eventtitle;
    /**
     * The start property to map from the given dataset
     */
    eventstart;
    /**
     * The end property to map from the given dataset
     */
    eventend;
    /**
     * The allDay property to map from the given dataset
     */
    eventallday;
    /**
     * The class property to map from the given dataset
     */
    eventclass;

    /**
     * Private property to map the eventSources to the calendar
     */
    private eventSources = {
        events: []
    };
    /**
     * Private property to map the event data such as when event starts dragged the current position data is inserted into this
     */
    private oldData;
    /**
     * Private property to map the fullcalendar Element rendered
     */
    private $fullCalendar;
    /**
     * Private property to map the model to the mobile calendar
     */
    private _model_;
    /**
     * Private property to map the eventSources to the mobile calendar
     */
    private eventData;
    /**
     * Private property to map the events to the mobile calendar
     */
    private events;
    /**
     * Private property to store the changes when the fullcalendar is not yet rendered
     */
    private changesStack = [];

    /**
     * Private property to map the calendarOptions to the calendar
     */
    private calendarOptions: any = {
        calendar: {
            height: 600,
            eventSources: this.eventSources,
            editable: true,
            locale: 'en',
            selectable: false,
            header: defaultHeaderOptions,
            buttonText: {
                month: BUTTON_TEXT.MONTH,
                week : BUTTON_TEXT.WEEK,
                day  : BUTTON_TEXT.DAY,
                year : BUTTON_TEXT.YEAR,
                today: BUTTON_TEXT.TODAY
            },
            eventDrop: (event, delta, revertFunc, jsEvent, ui, view) => {
                this.onEventdropProxy(event, delta, revertFunc, jsEvent, ui, view);
            },
            eventResizeStart: (event, jsEvent, ui, view) => {
                this.onEventChangeStart(event, jsEvent, ui, view);
            },
            eventDragStart: (event, jsEvent, ui, view) => {
                this.onEventChangeStart(event, jsEvent, ui, view);
            },
            eventResize: (event, delta, revertFunc, jsEvent, ui, view) => {
                this.onEventresizeProxy(event, delta, revertFunc, jsEvent, ui, view);
            },
            eventClick: (event, jsEvent, view) => {
                this.eventClickProxy(event, jsEvent, view);
            },
            select: (start, end, jsEvent, view) => {
                this.onSelectProxy(start, end, jsEvent, view);
            },
            eventRender: (event, jsEvent, view) => {
                this.eventRenderProxy(event, jsEvent, view);
            },
            viewRender: (view, element) => {
                this.viewRenderProxy(view, element);
            },
            unselectAuto: false,
            views: {
                month: {
                    eventLimit: 0
                }
            }
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

    // this function takes the calendar view to the default date given for the calendar
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

    /**
     * Private method to set the selectedData when a day is clicked, returns the new data
     */
    private setSelectedData(start, end) {
        let dataset = this.dataset;

        const filteredDates = [],
            eventStartKey = this.eventstart || 'start',
            eventEndKey = this.eventend || 'end',
            startDate = moment(new Date(start)).format('MM/DD/YYYY'),
            endDate = moment(new Date(end)).subtract(1, 'days').format('MM/DD/YYYY');

        if (!dataset) {
            return;
        }
        dataset = dataset.data || dataset;
        dataset.forEach((value) => {
            if (!value[eventStartKey]) {
                return;
            }
            const eventStartDate   = moment(new Date(value[eventStartKey])).format('MM/DD/YYYY'),
                eventEndDate   = moment(new Date(value[eventEndKey] || value[eventStartKey])).format('MM/DD/YYYY'),
                eventExists = moment(eventStartDate).isSameOrAfter(startDate) && moment(eventEndDate).isSameOrBefore(endDate);
            if (eventExists) {
                filteredDates.push(value);
            }
        });
        return filteredDates;
    }
    /**
     * Private property to proxy the onEventdrop
     */
    private onEventdropProxy(event, delta, revertFunc, jsEvent, ui, view) {
        invokeEventHandler(this, 'eventdrop', {jsEvent, event, oldData: this.oldData, delta, revertFunc, ui, view});
    }
    /**
     * Private property to proxy the onSelect
     */
    private onSelectProxy(start, end, jsEvent, view) {
        this.selecteddates = {start: getUTCDateTime(start), end: getUTCDateTime(end)};
        this.selecteddata = this.setSelectedData(start, end);
        invokeEventHandler(this, 'select', {start: start.valueOf(), end: end.valueOf(), view, selecteddata: this.selecteddata});
    }
    /**
     * Private property to proxy the onEventresize
     */
    private onEventresizeProxy(event, delta, revertFunc, jsEvent, ui, view) {
        invokeEventHandler(this, 'eventresize', {jsEvent, event, oldData: this.oldData, delta, revertFunc, ui, view});
    }
    /**
     * Private property to proxy the onEventChangeStart
     */
    private onEventChangeStart(event, jsEvent, ui, view) {
        this.oldData = getClonedObject(event);
    }
    /**
     * Private property to proxy the onEventclick
     */
    private eventClickProxy(event, jsEvent, view) {
        invokeEventHandler(this, 'eventclick', {jsEvent, event, view});
    }
    /**
     * Private property to proxy the onEventrender
     */
    private eventRenderProxy(event, jsEvent, view) {
        if (this.calendartype === VIEW_TYPES.LIST) {
            this.$fullCalendar.find('.fc-list-table').addClass('table');
        }
        invokeEventHandler(this, 'eventrender', {jsEvent, event, view});
    }
    /**
     * Private property to proxy the viewrender
     */
    private viewRenderProxy(view, element) {
        this.currentview = {start: view.start.format(), end: view.end.subtract(1, 'days').format()};
        if (this.calendartype === VIEW_TYPES.LIST) {
            this.$fullCalendar.find('.fc-list-table').addClass('table');
        }
        invokeEventHandler(this, 'viewrender', {view});
    }
    /**
     * Private property to update the calendar header options once the controls changes
     */
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
        const $parent = $(this.$element).parent(),
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
        this._model_ = this._model_ || moment().valueOf();
        this.selecteddates = {
            start: moment(this._model_).valueOf(),
            end  : moment(this._model_).endOf('day').valueOf()
        };
        invokeEventHandler(this, 'eventrender', {$data: this.eventData});
    }

    /**
     * Private property to prepare calendar events for the mobie calendar
     */
    private prepareCalendarEvents () {
        let eventDay,
            dataset;
        this.eventData = {};
        if (!this.dataset) {
            return;
        }
        dataset = this.dataset.data || this.dataset;
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
    /**
     * Private method to construct the calendar dataset by mapping the eventstart, eventend, eventtitle etc.,
     */
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
                    objVal = getEvaluatedData(obj, {displayexpression: value});
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

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER, ['height']);
    }

    onStyleChange(key, newVal, oldVal?) {
        if (key === 'height') {
            this.calendarOptions.calendar.height = this.calculateHeight(newVal);
            this.updateCalendarOptions('option', 'height', this.calendarOptions.calendar.height);
        }
    }

    onPropertyChange(key, newVal, ov?) {
        switch (key) {
            case 'selectionmode':
                if (newVal !== SELECTION_MODES.NONE) {
                    this.calendarOptions.calendar.selectable = true;
                    this.updateCalendarOptions('option', 'selectable', true);
                    if (newVal === SELECTION_MODES.SINGLE) {
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
                if (newVal !== 'month' || this.calendartype === VIEW_TYPES.LIST) {
                    this.calendarOptions.calendar.defaultView = this.calendartype + _.capitalize(newVal);
                } else {
                    this.calendarOptions.calendar.defaultView = newVal;
                }
                this.updateCalendarOptions('changeView', this.calendarOptions.calendar.defaultView);
            // mobile newVal === 'week' defaultView = 'day'
                break;
            case 'calendartype':
                this.calendartype = newVal || 'basic';
                this.updateCalendarHeaderOptions();
                break;
            case 'dataset':
                let dataSet;
                const eventSet = [];
                // triggerCalendarChange(); -> Mobile related
                delete this.eventSources.events;
                this.dataset = newVal;
                dataSet = getClonedObject(newVal.data || newVal);
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
    /**
     * Method to update the calendar options at any point of time
     */
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
}
