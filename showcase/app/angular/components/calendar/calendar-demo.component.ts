import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

const today: Date = new Date();

const getDateObj = () => {
    const dateObj = new Date(today);
    return {dateObj, add: (days) => dateObj.setDate(dateObj.getDay() + (days || 0))};
};

@Component({
  selector: 'app-calendar-demo',
  templateUrl: './calendar-demo.component.html'
})
export class CalendarDemoComponent {

    height = '650px';

    selectedView: string = 'month';

    selectionMode: string = 'single';

    calendarDataset: any[] =  [
        {
            'title' : 'All Day Event',
            'start' : getDateObj().dateObj
        },
        {
            'title' : 'Long Event',
            'start' : getDateObj().add(1),
            'end'   : getDateObj().add(8)
        },
        {
            'id'    : 999,
            'title' : 'Repeating Event',
            'start' : getDateObj().add(3),
            'allDay': false
        },
        {
            'id'    : 999,
            'title' : 'Repeating Event',
            'start' : getDateObj().add(3),
            'allDay': false
        },
        {
            'title' : 'Birthday Party',
            'start' : getDateObj().add(13),
            'end'   : getDateObj().add(13),
            'allDay': false
        },
        {
            'title' : 'Click for Google',
            'start' : getDateObj().add(9),
            'end'   : getDateObj().add(10),
            'url'   : 'http://google.com/'
        }
    ];

    calendarType = 'agenda';

    changeData = () => {
        this.calendarDataset = [ // put the array in the `events` property
            {
                'eventName'  : 'event2',
                'start'  : new Date()
            }
        ];
    }

    onViewRender(view) {
        console.log('View rendered!!!', view);
    }

    onSelect(start, end) {
        this.toaster.success('Start: ' + new Date(start).toDateString() + '\n' + 'End: ' + new Date(end).toDateString(), 'Day Clicked!');
        console.log(new Date(start), new Date(end));
    }

    onEventclick(jsEvent, event, view) {
        this.toaster.info('Am the ' + event.title , 'Event Clicked!', { timeOut: 3000, closeButton: true, progressBar: true });
    }

    onEventDrop(jsEvent, event, oldData, delta, revertFunc, ui, view) {
        this.toaster.info(`You've dragged ${event.title} from ${oldData._start.format('DD/MM/YYYY')} to ${event._start.format('DD/MM/YYYY')}`);
    }

    constructor(private toaster: ToastrService) { }
}
