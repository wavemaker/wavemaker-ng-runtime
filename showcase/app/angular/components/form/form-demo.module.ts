import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormDemoRoutingModule } from './form-demo-routing.module';
import { FormDemoComponent } from './form-demo.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormDemoRoutingModule,
    WmComponentsModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [FormDemoComponent]
})
export class FormDemoModule { }
