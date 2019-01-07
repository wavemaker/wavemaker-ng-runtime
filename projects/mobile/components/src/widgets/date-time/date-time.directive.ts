import { Directive } from '@angular/core';

import { DatetimeComponent } from '@wm/components';

@Directive({
    selector: '[wmDateTime]'
})
export class DateTimeDirective {

    constructor(dateTimeComponent: DatetimeComponent) {
        dateTimeComponent.useDatapicker = false;
        dateTimeComponent.datepattern = 'yyyy-MM-ddTHH:mm:ss';
        dateTimeComponent.updateFormat('datepattern');
    }

}