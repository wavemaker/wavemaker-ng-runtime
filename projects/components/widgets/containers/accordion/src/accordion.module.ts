import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { AccordionDirective } from './accordion.directive';
import { AccordionPaneComponent } from './accordion-pane/accordion-pane.component';

const components = [
    AccordionPaneComponent,
    AccordionDirective
];

@NgModule({
    imports: [
        CommonModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class AccordionModule {
}
