import { Directive } from '@angular/core';

import { TimeComponent } from '@wm/components';

@Directive({
    selector: '[wmTime]'
})
export class TimeDirective {

    constructor(timeComponent: TimeComponent) {
        timeComponent.useDatapicker = false;
        timeComponent.datepattern = 'hh:mm';
        timeComponent.updateFormat('datepattern');
    }

}