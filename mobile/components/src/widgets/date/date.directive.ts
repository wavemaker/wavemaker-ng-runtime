import { Directive } from '@angular/core';

import { DateComponent } from '@wm/components';

@Directive({
    selector: '[wmDate]'
})
export class DateDirective {

    constructor(dateComponent: DateComponent) {
        dateComponent.useDatapicker = false;
    }

}