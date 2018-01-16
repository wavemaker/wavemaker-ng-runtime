import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconDemoRoutingModule } from './icon-routing.module';
import { IconDemoComponent } from './icon-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    IconDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [IconDemoComponent]
})
export class IconDemoModule { }
