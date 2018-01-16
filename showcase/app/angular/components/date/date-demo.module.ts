import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DateDemoRoutingModule } from './date-demo-routing.module';
import { DateDemoComponent } from './date-demo.component';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    DateDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [DateDemoComponent]
})
export class DateDemoModule { }
