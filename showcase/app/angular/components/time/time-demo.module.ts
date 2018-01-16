import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeDemoRoutingModule } from './time-demo-routing.module';
import { TimeDemoComponent } from './time-demo.component';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    TimeDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [TimeDemoComponent]
})
export class TimeDemoModule { }
