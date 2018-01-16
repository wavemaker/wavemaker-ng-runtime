import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RadiosetDemoRoutingModule } from './radioset-demo-routing.module';
import { RadiosetDemoComponent } from './radioset-demo.component';
import { FormsModule } from '@angular/forms';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RadiosetDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [RadiosetDemoComponent]
})
export class RadiosetDemoModule { }
