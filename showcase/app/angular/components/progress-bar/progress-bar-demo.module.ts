import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgressBarRoutingModule } from './progress-bar-demo-routing.module';
import { ProgressBarDemoComponent } from './progress-bar-demo.component';
import { FormsModule } from '@angular/forms';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    ProgressBarRoutingModule,
      FormsModule,
      WmComponentsModule
  ],
  declarations: [ProgressBarDemoComponent]
})
export class ProgressBarDemoModule { }
