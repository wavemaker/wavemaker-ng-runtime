import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessageDemoRoutingModule } from './message-demo-routing.module';
import { MessageDemoComponent } from './message-demo.component';
import { WmComponentsModule } from '@components/components.module';
import {FormsModule} from '@angular/forms';

@NgModule({
    imports: [
      FormsModule,
      CommonModule,
      MessageDemoRoutingModule,
      WmComponentsModule
    ],
    declarations: [MessageDemoComponent]
})
export class MessageDemoModule { }
