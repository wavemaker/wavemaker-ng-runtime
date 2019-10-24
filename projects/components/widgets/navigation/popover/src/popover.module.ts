import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PopoverModule as NgxPopoverModule } from 'ngx-bootstrap/popover';

import { WmComponentsModule } from '@wm/components/base';

import { PopoverComponent } from './popover.component';

const components = [
    PopoverComponent
];

@NgModule({
    imports: [
        CommonModule,
        NgxPopoverModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class PopoverModule {
}
