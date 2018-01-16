import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MenuDemoRoutingModule } from './menu-demo-routing.module';
import { MenuDemoComponent } from './menu-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        MenuDemoRoutingModule,
        FormsModule,
        WmComponentsModule
    ],
    declarations: [MenuDemoComponent]
})
export class MenuDemoModule { }
