import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PanelDemoRoutingModule } from './panel-demo-routing.module';
import { PanelDemoComponent } from './panel-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        PanelDemoRoutingModule,
        FormsModule,
        WmComponentsModule
    ],
    declarations: [PanelDemoComponent]
})
export class PanelDemoModule { }
