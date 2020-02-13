import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { LayoutgridDirective } from './layout-grid.directive';
import { LayoutGridRowDirective } from './layout-grid-row/layout-grid-row.directive';
import { LayoutGridColumnDirective } from './layout-grid-column/layout-grid-column.directive';

const components = [
    LayoutgridDirective,
    LayoutGridRowDirective,
    LayoutGridColumnDirective
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
export class LayoutGridModule {
}
