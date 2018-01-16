import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule } from '@angular/forms';

import { TileDemoComponent } from './tile-demo.component';
import { TileDemoRoutingModule } from './tile-demo-routing.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        WmComponentsModule,
        TileDemoRoutingModule
    ],
    declarations: [TileDemoComponent]
})
export class TileDemoModule { }
