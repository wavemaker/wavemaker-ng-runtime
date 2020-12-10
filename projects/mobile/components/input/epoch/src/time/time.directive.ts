import { Directive } from '@angular/core';

import { TimeComponent } from '@wm/components/input/epoch';

@Directive({
    selector: '[wmTime]'
})
export class TimeDirective {

    constructor(timeComponent: TimeComponent) {
        timeComponent.useDatapicker = false;
    }
}
