import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GridcolumnDemoRoutingModule } from './gridcolumn-demo-routing.module';
import { GridcolumnDemoComponent } from './gridcolumn-demo.component';

@NgModule({
  imports: [
    CommonModule,
    GridcolumnDemoRoutingModule
  ],
  declarations: [GridcolumnDemoComponent]
})
export class GridcolumnDemoModule { }
