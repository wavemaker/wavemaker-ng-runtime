import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarDemoRoutingModule } from './calendar-demo-routing.module';
import { CalendarDemoComponent } from './calendar-demo.component';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    CalendarDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [CalendarDemoComponent]
})
export class CalendarDemoModule { }
