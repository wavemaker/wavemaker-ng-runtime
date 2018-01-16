import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-calendar-demo',
  templateUrl: './calendar-demo.component.html'
})
export class CalendarDemoComponent {

    height = 600;

    selectedView: string = 'month';

    selectionMode: string = 'single';

    eventTitle: string = 'eventName';

    calendarDataset: any[] =  [
        {
            'title' : 'All Day Event',
            'start' : 'Tue Nov 28 2017 00:00:00 GMT+0530 (India Standard Time)'
        },
        {
            'title' : 'Long Event',
            'start' : 'Thu Nov 30 2017 00:00:00 GMT+0530 (India Standard Time)',
            'end'   : 'Fri Dec 08 2017 00:00:00 GMT+0530 (India Standard Time)'
        },
        {
            'id'    : 999,
            'title' : 'Repeating Event',
            'start' : 'Fri Dec 01 2017 00:00:00 GMT+0530 (India Standard Time)',
            'allDay': false
        },
        {
            'id'    : 999,
            'title' : 'Repeating Event',
            'start' : 'Fri Dec 01 2017 00:00:00 GMT+0530 (India Standard Time)',
            'allDay': false
        },
        {
            'title' : 'Birthday Party',
            'start' : 'Wed Dec 20 2017 00:00:00 GMT+0530 (India Standard Time)',
            'end'   : 'Thu Dec 21 2017 00:00:00 GMT+0530 (India Standard Time)',
            'allDay': false
        },
        {
            'title' : 'Click for Google',
            'start' : 'Wed Dec 20 2017 00:00:00 GMT+0530 (India Standard Time)',
            'end'   : 'Wed Dec 20 2017 00:00:00 GMT+0530 (India Standard Time)',
            'url'   : 'http://google.com/'
        }
    ];

    calendarType = 'list';

    changeData = () => {
        this.calendarDataset = [ // put the array in the `events` property
            {
                'eventName'  : 'event2',
                'start'  : new Date()
            }
        ];
    }

    onViewRender = (view) => {
        console.log('View rendered!!!');
    }

    onSelect = (start, end) => {
        this.toaster.success('Start: ' + new Date(start).toDateString() + '\n' + 'End: ' + new Date(end).toDateString(), 'Day Clicked!', { timeOut: 300000 });
        console.log(new Date(start), new Date(end));
    }

    onEventclick = (jsEvent, event, view) => {
        this.toaster.info('Am the ' + event.title , 'Event Clicked!', { timeOut: 300000 });
    }

    onEventDrop = (jsEvent, event, oldData, delta, revertFunc, ui, view) => {
        this.toaster.info(`You've dragged ${event.title} from ${oldData._start.format('DD/MM/YYYY')} to ${event._start.format('DD/MM/YYYY')}`);
    }

    constructor(private toaster: ToastrService) { }
}
