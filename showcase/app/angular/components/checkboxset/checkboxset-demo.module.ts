import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {WmComponentsModule} from '@components/components.module';
import {CheckboxsetDemoRoutingModule} from './checkboxset-demo-routing.module';
import {CheckboxsetDemoComponent} from './checkboxset-demo.component';

@NgModule({
  imports: [
    CommonModule,
    CheckboxsetDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [CheckboxsetDemoComponent]
})
export class CheckboxsetDemoModule { }
