import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HtmlDemoRoutingModule } from './html-demo-routing.module';
import { HtmlDemoComponent } from './html-demo.component';
import { WmComponentsModule } from '@components/components.module';
import {FormsModule} from '@angular/forms';

@NgModule({
    imports: [
      CommonModule,
      HtmlDemoRoutingModule,
      WmComponentsModule,
      FormsModule
    ],
    declarations: [HtmlDemoComponent]
})
export class HtmlDemoModule { }
