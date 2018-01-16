import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoDemoRoutingModule } from './video-demo-routing.module';
import { VideoDemoComponent } from './video-demo.component';
import { WmComponentsModule } from '@components/components.module';
import {FormsModule} from '@angular/forms';
@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        VideoDemoRoutingModule,
        WmComponentsModule
    ],
    declarations: [VideoDemoComponent]
})
export class VideoDemoModule { }
