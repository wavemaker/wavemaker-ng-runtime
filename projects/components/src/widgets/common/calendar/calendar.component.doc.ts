import { Input } from '@angular/core';

/**
 * The wmCalendar component defines the Calendar widget.
 */
export class Calendar {

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Name of the Calendar.
     */
    @Input() name: string;

    /**
     * This property specifies the tab order of the Calendar Widget.
     */
    @Input() tabindex: number = 0;

    /**
     * Set this property to a data source to show events on the calendar. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any>;

    /**
     * Title for the Event, set from the Dataset fields.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() eventtitle: string;

    /**
     * Start date or date time for the event, set from the Dataset fields.
     */
    @Input() eventstart: string;

    /**
     * End date or date time for the event, set from the Dataset fields.
     */
    @Input() eventend: string;

    /**
     * Whether it is an All day event or not, set from the Dataset fields.
     */
    @Input() eventallday: string;

    /**
     * Class to be applied to that event, set from the Dataset fields.
     */
    @Input() eventclass: string;

    /**
     * This property will be used to show/hide the Calendar widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * this property when enabled, the initialization of the widget will be deferred till the widget becomes visible.
     * @type {boolean}
     */
    @Input() deferload: boolean = false;

    /**
     * This property allows to select different calendar types.<br>
     * <p><em>Allowed Values: </em><code>basic, agenda, list</code></p>
     * <div class="summary">
     * <p><code>basic</code><em>: Will show the events in a single row. </em></p>
     * <p><code>agenda</code><em>: Will show the complete day agenda with hours included.</em></p>
     * <p><code>list</code><em>: Will show the events in a list format.</em></p>
     * </div>
     */
    @Input() type: string = 'basic';

    /**
     * This property allows to enable the controls for the widget.<br>
     * <p><em>Allowed Values: </em><code>navigation, today, month, week, day</code></p>
     * <div class="summary">
     * <p><code>navigation</code><em>: Navigate between the months, weeks and days, depending on the calendar view.</em></p>
     * <p><code>today</code><em>: Select current day.</em></p>
     * <p><code>month</code><em>:  Switch the view to Month.</em></p>
     * <p><code>week</code><em>:  Switch the view to week.</em></p>
     * <p><code>day</code><em>:  Switch the view to day.</em></p>
     * </div>
     */
    @Input() controls: string = 'navigation,today,month,week,day';

    /**
     * This property allows to change the view of the calendar. <br>
     * <p><em>Allowed Values: </em><code>month, week, day</code></p>
     * <div class="summary">
     * <p><code>month</code><em>:  Displays all the days in the month.</em></p>
     * <p><code>week</code><em>:  Displays all the days in the week.</em></p>
     * <p><code>day</code><em>:  Displays a single day.</em></p>
     * </div>
     */
    @Input() view: string = 'month';

    /**
     * This property allows to configure dates selection in the calendar. <br>
     * <p><em>Allowed Values: </em><code>none, single, multiple</code></p>
     * <div class="summary">
     * <p><code>none</code><em>: No selection, the calendar is just there to present data, not to be selected.</em></p>
     * <p><code>single</code><em>: Only one row can be selected at a time.</em></p>
     * <p><code>multiple</code><em>: Many rows can be selected at a time.</em></p>
     * </div>
     */
    @Input() selectionmode: string = 'none';


    /**
     * Callback function which will be triggered when dates are selected in the calendar.
     * @param $start  Is a Timestamp indicating the beginning of the selection.
     * @param $end  Is a Timestamp indicating the end of the selection.
     * @param $view  An object containing information about a calendar view.
     * @param $data  List of all the events that fall within selected dates.
     */
    onSelect($start: number, $end: number, $view: any, $data: Array<any>) {}

    /**
     * Callback function which will be triggered when the calender view is changed or when the calendar is rendered.
     * @param $view  An object containing information about a calendar view.
     */
    onViewrender($view: any) {}

    /**
     * Callback function which will be triggered when dragging of an event in calendar stops and the event has moved to a different day/time..
     * @param $event  Is an Event Object that hold the event’s information (date, title, etc). Call hasTime on the event’s start/end to see if it has been dropped in a timed or all-day area (more info).
     * @param $newData  Calendar event object after its position change.
     * @param $oldData  Calendar event object before its position change.
     * @param $delta  Is a Duration Object that represents the amount of time the event was moved by. Available in version 2.0.1 and later.
     * @param $revertFunc  Is a function that, if called, reverts the event’s start/end date to the values before the drag.
     * @param $ui  Holds an empty object.
     * @param $view  An object containing information about a calendar view.
     */
    onEventdrop($event: Event, $newData: any, $oldData: any, $delta: any, $revertFunc: Function, $ui: any, $view: any) {}

    /**
     * Callback function which will be triggered when resizing of the event in calendar stops and the event has changed in duration..
     * @param $event  Is an Event Object that hold the event’s information (date, title, etc). Call hasTime on the event’s start/end to see if it has been dropped in a timed or all-day area (more info).
     * @param $newData  Calendar event object after its position change.
     * @param $oldData  Calendar event object before its position change.
     * @param $delta  Is a Duration Object that represents the amount of time the event was moved by. Available in version 2.0.1 and later.
     * @param $revertFunc  Is a function that, if called, reverts the event’s start/end date to the values before the drag.
     * @param $ui  Holds an empty object.
     * @param $view  An object containing information about a calendar view.
     */
    onEventresize($event: Event, $newData: any, $oldData: any, $delta: any, $revertFunc: Function, $ui: any, $view: any) {}

    /**
     * Callback function which will be triggered when resizing of the event in calendar stops and the event has changed in duration..
     * @param $event  Is an Event Object that hold the event’s information (date, title, etc).
     * @param $data  Calendar event object.
     * @param $view  An object containing information about a calendar view.
     */
    onEventclick($event: Event, $data: any, $view: any) {}

    /**
     * Callback function which will be triggered when an event is rendered.
     * @param $event  Is an Event Object that hold the event’s information (date, title, etc).
     * @param $data  Calendar event object.
     * @param $view  An object containing information about a calendar view.
     */
    onEventrender($event: Event, $data: any, $view: any) {}


    // Calendar Methods.

    /**
     * It highlights the default date given for the calendar.
     */
    selectDate() {}

    /**
     * It shows the calendar view to specific date given for the calendar.
     */
    gotoDate() {}

    /**
     * This method renders the present view for the next year.
     */
    gotoNextYear() {}

    /**
     * This method renders the present view (i.e. month/week view will be the same) for the next year.
     */
    gotoPrevYear() {}

    /**
     * It shows the calendar view to specific month given for the calendar.
     */
    gotoMonth() {}

    /**
     * This method renders the present view for the next month.
     */
    gotoNextMonth() {}

    /**
     * This method renders the present view for the previous month.
     */
    gotoPrevMonth() {}

    /**
     * This method rerenders the events from the data set.
     */
    rerenderEvents() {}
}