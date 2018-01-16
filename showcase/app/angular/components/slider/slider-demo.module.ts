import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SliderDemoRoutingModule } from './slider-demo-routing.module';
import { SliderDemoComponent } from './slider-demo.component';
import {WmComponentsModule} from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        SliderDemoRoutingModule,
        FormsModule,
        WmComponentsModule
    ],
    declarations: [SliderDemoComponent]
})
export class SliderDemoModule { }
