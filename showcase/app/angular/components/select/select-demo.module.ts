import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SelectDemoRoutingModule } from './select-demo-routing.module';
import { SelectDemoComponent } from './select-demo.component';
import { FormsModule } from '@angular/forms';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    SelectDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [SelectDemoComponent]
})
export class SelectDemoModule { }
