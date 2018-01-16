import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpinnerDemoRoutingModule } from './spinner-demo-routing.module';
import { SpinnerDemoComponent } from './spinner-demo.component';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        SpinnerDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    declarations: [SpinnerDemoComponent]
})
export class SpinnerDemoModule { }
