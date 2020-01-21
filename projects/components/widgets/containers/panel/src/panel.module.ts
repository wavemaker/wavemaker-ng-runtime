import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { WmComponentsModule } from '@wm/components/base';
import { MenuModule } from '@wm/components/navigation/menu';

import { PanelComponent } from './panel.component';

const components = [
    PanelComponent
];

@NgModule({
    imports: [
        BsDropdownModule,
        CommonModule,
        MenuModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class PanelModule {
}
