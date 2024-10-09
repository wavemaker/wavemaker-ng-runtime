import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { CoreModule } from '@wm/core';
import { WmComponentsModule } from '@wm/components/base';

import { CalendarComponent } from './calendar.component';

const components = [
    CalendarComponent
];

@NgModule({
    imports: [
        CoreModule,
        BsDatepickerModule,
        CommonModule,
        FormsModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components]
})
export class CalendarModule {
}
