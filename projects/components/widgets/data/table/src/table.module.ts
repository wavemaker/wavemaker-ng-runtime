import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { WmComponentsModule } from '@wm/components/base';
import { BasicModule } from '@wm/components/basic';
import { InputModule } from '@wm/components/input';
import { ListModule } from '@wm/components/data/list';
import { PaginationModule } from '@wm/components/data/pagination';

import { TableComponent } from './table.component';
import { TableCUDDirective } from './table-cud.directive';
import { TableFilterSortDirective } from './table-filter.directive';
import { TableActionDirective } from './table-action/table-action.directive';
import { TableColumnDirective } from './table-column/table-column.directive';
import { TableColumnGroupDirective } from './table-column-group/table-column-group.directive';
import { TableRowDirective } from './table-row/table-row.directive';
import { TableRowActionDirective } from './table-row-action/table-row-action.directive';

const components = [
    TableComponent,
    TableCUDDirective,
    TableFilterSortDirective,
    TableActionDirective,
    TableColumnDirective,
    TableColumnGroupDirective,
    TableRowDirective,
    TableRowActionDirective
];

@NgModule({
    imports: [
        BasicModule,
        CommonModule,
        InputModule,
        ListModule,
        PaginationModule,
        TooltipModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class TableModule {
}
