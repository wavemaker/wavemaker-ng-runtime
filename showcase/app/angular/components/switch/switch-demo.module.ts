import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SwitchDemoRoutingModule } from './switch-routing.module';
import { SwitchDemoComponent } from './switch-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    SwitchDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [SwitchDemoComponent]
})
export class SwitchDemoModule { }
