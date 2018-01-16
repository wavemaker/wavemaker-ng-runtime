import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AnchorDemoRoutingModule } from './anchor-routing.module';
import { AnchorDemoComponent } from './anchor-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    AnchorDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [AnchorDemoComponent]
})
export class AnchorDemoModule { }
