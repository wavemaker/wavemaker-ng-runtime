import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TabDemoRoutingModule } from './tab-demo-routing.module';
import { TabDemoComponent } from './tab-demo.component';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        TabDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    declarations: [TabDemoComponent]
})
export class TabDemoModule { }
