import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DatepickerModule } from 'ngx-bootstrap/datepicker';

import { WmComponentsModule } from '@wm/components/base';

import { CalendarComponent } from './calendar.component';

const components = [
    CalendarComponent
];

@NgModule({
    imports: [
        DatepickerModule,
        CommonModule,
        FormsModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class CalendarModule {
}
