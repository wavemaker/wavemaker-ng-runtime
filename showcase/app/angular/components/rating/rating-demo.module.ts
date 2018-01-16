import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RatingDemoRoutingModule } from './rating-demo-routing.module';
import { RatingDemoComponent } from './rating-demo.component';
import {WmComponentsModule} from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RatingDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [RatingDemoComponent]
})
export class RatingDemoModule { }
