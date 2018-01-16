import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutgridDemoRoutingModule } from './layoutgrid-demo-routing.module';
import {LayoutgridDemoComponent} from './layoutgrid-demo.component';
import {WmComponentsModule} from '@components/components.module';
import {FormsModule} from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        LayoutgridDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    exports: [LayoutgridDemoComponent],
    declarations: [LayoutgridDemoComponent]
})
export class LayoutgridDemoModule { }
