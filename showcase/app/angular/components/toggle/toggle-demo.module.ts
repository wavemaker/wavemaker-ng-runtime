import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToggleDemoRoutingModule } from './toggle-demo-routing.module';
import { WmComponentsModule } from '@components/components.module';
import { ToggleDemoComponent } from './toggle-demo.component';

@NgModule({
    imports: [
        CommonModule,
        WmComponentsModule,
        FormsModule,
        ToggleDemoRoutingModule
    ],
    declarations: [ToggleDemoComponent]
})
export class ToggleDemoModule { }
