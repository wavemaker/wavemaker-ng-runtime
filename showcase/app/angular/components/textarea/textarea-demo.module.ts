import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TextareaDemoRoutingModule } from './textarea-demo-routing.module';
import { TextareaDemoComponent } from './textarea-demo.component';
import {WmComponentsModule} from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    TextareaDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [TextareaDemoComponent]
})
export class TextareaDemoModule { }
