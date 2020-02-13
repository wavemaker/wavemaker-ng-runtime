import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

import { WmComponentsModule } from '@wm/components/base';

import { DateComponent } from './date/date.component';
import { DatetimeComponent } from './date-time/date-time.component';
import { TimeComponent } from './time/time.component';

const components = [
    DateComponent,
    DatetimeComponent,
    TimeComponent
];

@NgModule({
    imports: [
        CommonModule,
        BsDatepickerModule,
        BsDropdownModule,
        FormsModule,
        TimepickerModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class EpochModule {
}
