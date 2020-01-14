import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { BasicModule } from '@wm/components/basic';

import { ChartComponent } from './chart.component';

const components = [
    ChartComponent
];

@NgModule({
    imports: [
        BasicModule,
        CommonModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class ChartModule {
}
