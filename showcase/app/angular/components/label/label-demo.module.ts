import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabelDemoComponent } from './label-demo.component';
import { LabelDemoRoutingModule } from './label-routing.module';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    LabelDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [LabelDemoComponent]
})
export class LabelDemoModule { }
