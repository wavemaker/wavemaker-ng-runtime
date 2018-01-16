import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AccordionDemoRoutingModule } from './accordion-demo-routing.module';
import { AccordionDemoComponent } from './accordion-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        AccordionDemoRoutingModule,
        WmComponentsModule
    ],
    declarations: [AccordionDemoComponent]
})
export class AccordionDemoModule { }
