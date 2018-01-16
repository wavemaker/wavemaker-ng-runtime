import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ColorpickerDemoRoutingModule } from './colorpicker-demo-routing.module';
import { ColorpickerDemoComponent } from './colorpicker-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        ColorpickerDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    declarations: [ColorpickerDemoComponent]
})
export class ColorpickerDemoModule { }
