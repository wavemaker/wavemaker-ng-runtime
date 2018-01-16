import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaginationDemoRoutingModule } from './pagination-demo-routing.module';
import { PaginationDemoComponent } from './pagination-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        PaginationDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    declarations: [PaginationDemoComponent]
})
export class PaginationDemoModule { }
