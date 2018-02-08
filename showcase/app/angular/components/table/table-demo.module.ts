import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableDemoRoutingModule } from './table-demo-routing.module';
import { TableDemoComponent } from './table-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        TableDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    declarations: [TableDemoComponent]
})
export class TableDemoModule { }
