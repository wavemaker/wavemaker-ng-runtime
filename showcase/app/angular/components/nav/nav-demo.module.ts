import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavDemoRoutingModule } from './nav-demo-routing.module';
import { NavDemoComponent } from './nav-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        NavDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    declarations: [NavDemoComponent]
})
export class NavDemoModule { }
