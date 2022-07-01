import { DatePickerInnerComponent } from 'ngx-bootstrap/datepicker/datepicker-inner.component';

import { AfterViewInit, AfterContentInit, Component, ElementRef, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import {getClonedObject, getSessionStorageItem, AbstractI18nService, isMobileApp, isMobile} from '@wm/core';

import { APPLY_STYLES_TYPE, createArrayFrom, getEvaluatedData, IWidgetConfig, IRedrawableComponent, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './calendar.props';

declare const _, $, moment;

const DEFAULT_CLS = 'app-calendar';
const dateFormats = ['yyyy-MM-dd', 'yyyy-M-dd', 'M-dd-yyyy', 'MM-dd-yy', 'yyyy, dd MMMM', 'yyyy, MMM dd', 'MM/dd/yyyy', 'M/d/yyyy', 'EEE, dd MMM yyyy', 'EEE MMM dd yyyy', 'EEEE, MMMM dd, yyyy', 'timestamp'];
const defaultHeaderOptions = {
    start: 'prev next today',
    center: 'title',
    end: 'dayGridMonth dayGridWeek dayGridDay'
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
    dateObj = moment(dateObj);
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
const dateFormat = 'YYYY/MM/DD';

@Component({
    selector: '[wmCalendar]',
    templateUrl: './calendar.component.html',
    styleUrls: ['../../../../../../node_modules/fullcalendar/main.css'],
    providers: [
        provideAsWidgetRef(CalendarComponent)
    ],
    encapsulation: ViewEncapsulation.None
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

    // calendarOptions to the calendar
    private calendarOptions: any = {
        calendar: {
            height: 600,
            eventSources: this.eventSources,
            editable: true,
            locale: getSessionStorageItem('selectedLocale') || 'en',
            selectable: false,
            longPressDelay: isMobile() ? 1 : 1000,
            headerToolbar: defaultHeaderOptions,
            nextDayThreshold: NEXT_DAY_THRESHOLD,
            views: {
                month: {
                    dayMaxEventsRow: true
                }
            },
            unselectAuto: false,
            eventDrop: this.eventDrop.bind(this),
            eventResizeStart: this.onEventChangeStart.bind(this),
            eventDragStart: this.onEventChangeStart.bind(this),
            eventResize: this.eventResize.bind(this),
            eventClick: this.eventClick.bind(this),
            select: this.select.bind(this),
            eventDidMount: this.eventDidMount.bind(this),
            viewDidMount: this.viewDidMount.bind(this)        }
    };
    public view: string;
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

        this.$fullCalendar.gotoDate( moment(start)._d); // after selecting the date go to the date.
        
        this.$fullCalendar.select(start.valueOf(), end.valueOf());
    }

    // changes the calendar view to the default date given for the calendar.
    public gotoDate() {
        this.$fullCalendar.gotoDate( moment(this.datavalue)._d);
    }

    // this function takes the calendar view to the a year ahead
    public gotoNextYear() {
        this.$fullCalendar.nextYear();
    }

    // this function takes the calendar view to the a year before
    public gotoPrevYear() {
        this.$fullCalendar.prevYear();
    }

    /**
     * this function takes the calendar view to the specified month
     * @param monthVal, 1-12 value of month
     */
    public gotoMonth(monthVal) {
        let presentDay = this.$fullCalendar.getDate();
        const presentMonthVal = presentDay.getMonth();
        presentDay = moment(presentDay);
        if (presentMonthVal < monthVal) {
            this.$fullCalendar.gotoDate(presentDay.add(monthVal - presentMonthVal - 1, 'M').valueOf());
        } else {
            this.$fullCalendar.gotoDate(presentDay.subtract( presentMonthVal - monthVal + 1, 'M').valueOf());
        }
    }

    // this function takes the calendar view to the a month ahead
    public gotoNextMonth() {
        const presentDay = moment(this.$fullCalendar.getDate());
        this.$fullCalendar.gotoDate(presentDay.add(1, 'M').valueOf());
    }

    // this function takes the calendar view to the a month before
    public gotoPrevMonth() {
        const presentDay = moment(this.$fullCalendar.getDate());
        this.$fullCalendar.gotoDate(presentDay.subtract(1, 'M').valueOf());
    }


    // this function re-renders the events assigned to the calendar.
    public rerenderEvents() {
        this.$fullCalendar.render();
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

    private eventDrop(eventDropInfo) {
        let newEventObj = this.convertEventObj(eventDropInfo.event);
        let oldEventObj = this.convertEventObj(eventDropInfo.oldEvent);
        this.invokeEventCallback('eventdrop', {$event: eventDropInfo.jsEvent, $newData: newEventObj, $oldData: oldEventObj, $delta: eventDropInfo.delta, $revertFunc: eventDropInfo.revert, $ui: {}, $view: eventDropInfo.view});
    }

    // Returns the default date when the datavalue is provided
    getDefaultDate() {
        if (this.datavalue) {
            return new Date(this.datavalue);
        }
    }

    getDefaultOptions() {
        return this.calendarOptions;
    }

    getLib() {
        return 'fullcalendar';
    }

    private select($selectionInfo) {
        this.selecteddates = {start: getUTCDateTime($selectionInfo.start), end: getUTCDateTime($selectionInfo.end)};
        this.selecteddata = this.setSelectedData($selectionInfo.start, $selectionInfo.end);
        this.invokeEventCallback('select', {$start: $selectionInfo.start.valueOf(), $end: $selectionInfo.end.valueOf(), $view: $selectionInfo.view, $data: this.selecteddata});
    }

    /**
     *  this functions unselects all the selections in calendar
     */
    public unselect() {
        this.$fullCalendar.unselect();
    }

    /**
     * this function is to convert the new event object recieved from fullcalendar lib v-5.0 to
     * old event object in v-3.x
     * this is done for backward compatibility
     * @param eventObj event object as per new version (v5)
     * @returns eventObj event object as oer the old version (v3)
     */
    private convertEventObj(eventObj) {
        let newEventObj = {
            start: moment(eventObj.start),
            end: moment(eventObj.end)
        }
        Object.setPrototypeOf(newEventObj, eventObj);
        return newEventObj;         
    }

    private eventResize(eventResizeInfo) {
        let newEventObj = this.convertEventObj(eventResizeInfo.event);
        let oldEventObj = this.convertEventObj(eventResizeInfo.oldEvent);
        this.invokeEventCallback('eventresize', {$event: eventResizeInfo.jsEvent, $newData: newEventObj, $oldData: oldEventObj, $delta: eventResizeInfo.delta, $revertFunc: eventResizeInfo.revert, $ui: {}, $view: eventResizeInfo.view});
    }

    private onEventChangeStart(event) {
        this.oldData = getClonedObject(event);
    }

    private eventClick(eventClickInfo) {
        let eventObj = this.convertEventObj(eventClickInfo.event);
        this.invokeEventCallback('eventclick', {$event: eventClickInfo.jsEvent, $data: eventObj, $view: eventClickInfo.view});
    }

    private eventDidMount(event) {
        if (this.calendartype === VIEW_TYPES.LIST) {
            this.$element.find('.fc-list-table').addClass('table');
        }
        this.invokeEventCallback('eventrender', {$event: event.el, $data: event.event, $view: event.view});
    }

    private viewDidMount($view) {
        this.currentview = {start: moment($view.view.activeStart).format("YYYY-MM-DD"), end: moment($view.view.activeEnd).format("YYYY-MM-DD")};
        if (this.calendartype === VIEW_TYPES.LIST) {
            this.$element.find('.fc-list-table').addClass('table');
        }
        this.invokeEventCallback('viewrender', {$view: $view});
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
                right += (viewType === VIEW_TYPES.LIST) ? ' listMonth' : ' dayGridMonth';
            }

            if (_.includes(ctrls, 'week')) {
                right += (viewType === VIEW_TYPES.BASIC) ?  ' dayGridWeek' : (viewType === VIEW_TYPES.LIST) ? ' listWeek' : ' timeGridWeek';
            }

            if (regEx.test(ctrls)) {
                right += (viewType === VIEW_TYPES.BASIC) ?  ' dayGridDay' : (viewType === VIEW_TYPES.LIST) ? ' listDay' : ' timeGridDay';
            }
            if (left.charAt(0) === ' ') {
                left = left.substring(1);
            }
            if (right.charAt(0) === ' ') {
                right = right.substring(1);
            }
            _.extend(this.calendarOptions.calendar.headerToolbar, {'start': left, 'end': right});
        }
    }

    constructor(inj: Injector, i18nService: AbstractI18nService) {
        super(inj, WIDGET_CONFIG);

        this.eventSources.push(this.dataSetEvents);
        const FullCalendar = window['FullCalendar'];
        if (!FullCalendar.__wm_locale_initialized) {
            i18nService.initCalendarLocale();
            FullCalendar.__wm_locale_initialized = true;
        }
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER, ['height']);
        this.setLocale();
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
                            startTime: '00:00',
                            endTime: '24:00'
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
                this.calendartype = nv || 'dayGrid';
            case 'controls':
                this.updateCalendarHeaderOptions();
                break;
            case 'dataset':
                let dataSet;
                const self = this;
                this.dataset = nv;
                dataSet = createArrayFrom(getClonedObject(nv));
                dataSet = this.constructCalendarDataset(dataSet);
                this.dataSetEvents.events = dataSet.filter((event) => {
                    event.start = event.start || event.end;
                    if (event.start) {
                        return true;
                    }
                });

                this.renderEventDataSet();
                break;
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

    ngAfterViewInit() {
        super.ngAfterViewInit();
        const calendarEl = this._calendar.nativeElement;
        const FullCalendar = window['FullCalendar'];
        this.invokeEventCallback('beforerender', {'$event' : {}});
        const calendar = new FullCalendar.Calendar(calendarEl, this.calendarOptions.calendar);
        calendar.render();
        this.$fullCalendar =  calendar;
        // if the changes are already stacked before calendar renders then execute them when needed
        if (this.changesStack.length) {
            this.changesStack.forEach((changeObj) => {
                this.applyCalendarOptions(changeObj.operationType, changeObj.argumentKey, changeObj.argumentValue);
            });
            this.changesStack.length = 0;
        }

        //WMS-22412 : change calender's view based on the configuration set from studio
        setTimeout(() => {
            this.$fullCalendar.changeView(this.getViewType(this.view ? this.view : 'dayGridMonth'));
        });
    }

    // constructs the calendar dataset by mapping the eventstart, eventend, eventtitle etc.,
    private constructCalendarDataset(eventSource) {
        const properties = {
            title: this.eventtitle || 'title',
            allDay: this.eventallday || 'allday',
            start: this.eventstart || 'start',
            end: this.eventend || 'end',
            className: this.eventclass || 'className'
        };

        eventSource.forEach((obj) => {
            _.mapKeys(properties,  (value, key) => {
                let objVal;
                if (key === 'title') {
                    objVal = getEvaluatedData(obj, {expression: value}, this.viewParent);
                } else if (key === 'allDay') {
                    objVal = !!_.get(obj, value);
                } else {
                    objVal = _.get(obj, value);
                }
                if (!objVal) {
                    return;
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

    /**
     * override the default calendar options with the newSet of options
     * @param options
     */
    overrideDefaults(options) {
        _.extend(this.calendarOptions.calendar, options);
    }

    /**
     * if the operations are performed before the calendar renders, the changes are pushed into changesStack and will be executed after the calendar gets rendered
     * if the calendar is already rendered, then the specific operation will be performed according to the operation type
     * @param operationType
     * @param argumentKey
     * @param argumentValue
     */
    updateCalendarOptions(operationType: string, argumentKey?: any, argumentValue?: any): void {//
        if (!this.$fullCalendar) {
            this.changesStack.push({
                operationType: operationType,
                argumentKey: argumentKey,
                argumentValue: argumentValue
            });
            return;
        }
        this.applyCalendarOptions(operationType, argumentKey, argumentValue);
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

    /**
     * This function will receive an object containing source of calendar, apikey and calendarId and will integrate the respective calendar with fullcalendar.
     * @param eventObject
     */
    public addEventSource(eventObject) {
        if (_.isEmpty(eventObject)) {
            console.warn('addEventSource method requires an object as a parameter.');
            return;
        }
        if (eventObject.source === 'google') {
            if (!eventObject.googleCalendarApiKey || !eventObject.googleCalendarId ) {
                console.warn('For google calendar integration, \'googleCalendarApiKey\' and \'googleCalendarId\' should be passed in the parameter object.');
                return;
            }
            this.$fullCalendar.setOption('googleCalendarApiKey', eventObject.googleCalendarApiKey);
            this.$fullCalendar.addEventSource({
                googleCalendarId: eventObject.googleCalendarId
            });
        }
    }

    /**
     * get the viewTypeKey according to the calendarType and viewType selected
     * @param viewKey
     */
    getViewType(viewKey) {
        const calendarType = this.calendartype;
        const view = this.view;
        let result;

        if (view === 'month') {
            result = (calendarType === VIEW_TYPES.LIST) ? 'listMonth' : 'dayGridMonth';
        } else if (view === 'week') {
            result = (calendarType === VIEW_TYPES.BASIC) ?  'dayGridWeek' : (calendarType === VIEW_TYPES.LIST) ? 'listWeek' : 'timeGridWeek';
        } else if (view === 'day') {
            result = (calendarType === VIEW_TYPES.BASIC) ?  'dayGridDay' : (calendarType === VIEW_TYPES.LIST) ? 'listDay' : 'timeGridDay';
        } else if (view === 'year') {
            result = (calendarType === VIEW_TYPES.LIST) ? 'listYear' : '';
        } else {
            result = viewKey;
        }
        return result;
    }

    /**
     * @param operationType
     * @param argumentKey
     * @param argumentValue
     * Handle various operations like Rendering Calendar, changing the calendar viewType, setting the calendarOptions according to the operationType.
     */
    applyCalendarOptions(operationType: string, argumentKey?: any, argumentValue?: any): void {
        switch (operationType) {
            case 'render':
                this.$fullCalendar.render();
                break;
            case 'option':
                this.$fullCalendar.setOption(argumentKey, argumentValue);
                break;
            case 'changeView':
                const view = this.getViewType(argumentKey);
                this.$fullCalendar.changeView(view);
                break;
        }
    }

    /**
     * Adds the new eventsDataSet to the calendar object with addEvent Method and re-renders the calendar
     */
    renderEventDataSet() {
        const self = this;
        this.$fullCalendar.batchRendering(function() {
            const events = self.$fullCalendar.getEvents();
            _.each( events, function( event) {
                const eventData = self.$fullCalendar.getEventById(event.id);
                eventData.remove();
            });
            _.each( self.dataSetEvents.events, function( event) {
                self.$fullCalendar.addEvent(event);
            });
            self.$fullCalendar.render();
        });
    }
}
