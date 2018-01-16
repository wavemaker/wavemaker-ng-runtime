import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextDemoRoutingModule } from './text-demo-routing.module';
import { TextDemoComponent } from './text-demo.component';
import { FormsModule } from '@angular/forms';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    TextDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [TextDemoComponent]
})
export class TextDemoModule { }
