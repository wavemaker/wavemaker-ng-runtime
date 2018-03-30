import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ListDemoRoutingModule } from './list-demo-routing.module';
import { ListDemoComponent } from './list-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        ListDemoRoutingModule,
        FormsModule,
        WmComponentsModule
    ],
    declarations: [ListDemoComponent]
})
export class ListDemoModule { }
