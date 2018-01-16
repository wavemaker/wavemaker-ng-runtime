import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatetimeDemoRoutingModule } from './datetime-demo-routing.module';
import { DatetimeDemoComponent } from './datetime-demo.component';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    DatetimeDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [DatetimeDemoComponent]
})
export class DatetimeDemoModule { }
