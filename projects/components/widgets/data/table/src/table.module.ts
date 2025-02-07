import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { WmComponentsModule } from '@wm/components/base'; 
import { InputModule } from '@wm/components/input';
import { MenuModule } from '@wm/components/navigation/menu';
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
import { AnchorComponent } from '@wm/components/basic';

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
        AnchorComponent,
        BsDropdownModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InputModule,
        ListModule,
        MenuModule,
        PaginationModule,
        TooltipModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components]
})
export class TableModule {
}
