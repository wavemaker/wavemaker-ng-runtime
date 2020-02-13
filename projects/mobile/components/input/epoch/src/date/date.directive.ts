import { Directive } from '@angular/core';

import { DateComponent } from '@wm/components/input/epoch';

@Directive({
    selector: '[wmDate]'
})
export class DateDirective {

    constructor(dateComponent: DateComponent) {
        dateComponent.useDatapicker = false;
        dateComponent.datepattern = 'yyyy-MM-dd';
        dateComponent.updateFormat('datepattern');
    }
}
