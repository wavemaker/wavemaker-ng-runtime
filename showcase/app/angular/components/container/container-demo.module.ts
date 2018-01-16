import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContainerDemoRoutingModule } from './container-routing.module';
import { ContainerDemoComponent } from './container-demo.component';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        ContainerDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    declarations: [ContainerDemoComponent]
})
export class ContainerDemoModule { }
