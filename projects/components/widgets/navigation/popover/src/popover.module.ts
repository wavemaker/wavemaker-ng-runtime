import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PopoverModule as NgxPopoverModule } from 'ngx-bootstrap/popover';

import { WmComponentsModule } from '@wm/components/base';
import { BasicModule } from '@wm/components/basic';

import { PopoverComponent } from './popover.component';

const components = [
    PopoverComponent
];

@NgModule({
    imports: [
        CommonModule,
        BasicModule,
        NgxPopoverModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class PopoverModule {
}
