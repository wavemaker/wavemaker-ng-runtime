import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxDemoRoutingModule } from './checkbox-demo-routing.module';
import { CheckboxDemoComponent } from './checkbox-demo.component';
import { FormsModule } from '@angular/forms';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    CheckboxDemoRoutingModule,
    FormsModule,
    WmComponentsModule
  ],
  declarations: [CheckboxDemoComponent]
})
export class CheckboxDemoModule { }
