import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GridrowDemoRoutingModule } from './gridrow-demo-routing.module';
import { GridrowDemoComponent } from './gridrow-demo.component';

@NgModule({
  imports: [
    CommonModule,
    GridrowDemoRoutingModule
  ],
  declarations: [GridrowDemoComponent]
})
export class GridrowDemoModule { }
