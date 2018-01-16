import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtongroupDemoRoutingModule } from './buttongroup-demo-routing.module';
import { ButtongroupDemoComponent } from './buttongroup-demo.component';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ButtongroupDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [ButtongroupDemoComponent]
})
export class ButtongroupDemoModule { }
