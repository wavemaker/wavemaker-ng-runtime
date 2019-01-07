import { Calendar } from '@ionic-native/calendar';

import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';

const DEFAULT_TIME = new Date().getTime();
/*3 months timestamp value*/
const DELTA_VALUE_DATE =  (3 * 30 * 24 * 60 * 60 * 1000);
const DEFAULT_START_DATE = (DEFAULT_TIME - DELTA_VALUE_DATE);
const DEFAULT_END_DATE = (DEFAULT_TIME + DELTA_VALUE_DATE);
const EVENT_META = {
    title: '',
    message: '',
    location: '',
    startDate: new Date(),
    endDate: new Date()
};

/**
 * this file contains all calendar operations under 'calendar' service.
 */
export class CalendarService extends DeviceVariableService {
    public readonly name = 'calendar';
    public readonly operations: IDeviceVariableOperation[] = [];

    constructor(calendar: Calendar) {
        super();
        this.operations.push(new CreateEventOperation(calendar),
            new DeleteEventOperation(calendar),
            new GetEventsOperation(calendar));
    }
}

class CreateEventOperation implements IDeviceVariableOperation {
    public readonly name = 'createEvent';
    public readonly properties = [
            {target: 'eventTitle', type: 'string', dataBinding: true},
            {target: 'eventNotes', type: 'string', dataBinding: true},
            {target: 'eventLocation', type: 'string', dataBinding: true},
            {target: 'eventStart', type: 'datetime', dataBinding: true},
            {target: 'eventEnd', type: 'datetime', dataBinding: true}
        ];
    public readonly requiredCordovaPlugins = ['CALENDAR'];

    constructor(private calendar: Calendar) {

    }

    public invoke(variable: any, options: any, eventInfo: Map<string, any>): Promise<any> {
        return this.calendar.createEvent(
            eventInfo.get('eventTitle'),
            eventInfo.get('eventLocation'),
            eventInfo.get('eventNotes'),
            new Date(eventInfo.get('eventStart') || 0),
            new Date(eventInfo.get('eventEnd') || 0));
    }
}

class DeleteEventOperation implements IDeviceVariableOperation {
    public readonly name = 'deleteEvent';
    public readonly properties = [
        {target: 'eventTitle', type: 'string', dataBinding: true},
        {target: 'eventNotes', type: 'string', dataBinding: true},
        {target: 'eventLocation', type: 'string', dataBinding: true},
        {target: 'eventStart', type: 'datetime', dataBinding: true},
        {target: 'eventEnd', type: 'datetime', dataBinding: true}
    ];
    public readonly requiredCordovaPlugins = ['CALENDAR'];

    constructor(private calendar: Calendar) {

    }

    public invoke(variable: any, options: any, eventInfo: Map<string, any>): Promise<any> {
        return this.calendar.deleteEvent(
            eventInfo.get('eventTitle'),
            eventInfo.get('eventLocation'),
            eventInfo.get('eventNotes'),
            new Date(eventInfo.get('eventStart') || DEFAULT_START_DATE),
            new Date(eventInfo.get('eventEnd') || DEFAULT_END_DATE));
    }
}

class GetEventsOperation implements IDeviceVariableOperation {
    public readonly name = 'getEvents';
    public readonly model = [EVENT_META];
    public readonly properties = [
        {target: 'eventTitle', type: 'string', dataBinding: true},
        {target: 'eventNotes', type: 'string', dataBinding: true},
        {target: 'eventLocation', type: 'string', dataBinding: true},
        {target: 'eventStart', type: 'datetime', dataBinding: true},
        {target: 'eventEnd', type: 'datetime', dataBinding: true}
    ];
    public readonly requiredCordovaPlugins = ['CALENDAR'];

    constructor(private calendar: Calendar) {

    }

    public invoke(variable: any, options: any, eventInfo: Map<string, any>): Promise<any> {
        return this.calendar.findEvent(
            eventInfo.get('eventTitle'),
            eventInfo.get('eventLocation'),
            eventInfo.get('eventNotes'),
            new Date(eventInfo.get('eventStart') || DEFAULT_START_DATE),
            new Date(eventInfo.get('eventEnd') || DEFAULT_END_DATE));
    }
}
