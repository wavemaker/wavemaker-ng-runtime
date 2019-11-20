import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { DateDirective } from './date/date.directive';
import { DateTimeDirective } from './date-time/date-time.directive';
import { TimeDirective } from './time/time.directive';

const components = [
    DateDirective,
    DateTimeDirective,
    TimeDirective
];

@NgModule({
    imports: [
        CommonModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class EpochModule {
}
