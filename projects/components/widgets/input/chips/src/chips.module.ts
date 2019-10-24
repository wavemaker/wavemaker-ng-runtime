import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { SearchModule } from '@wm/components/basic/search';

import { ChipsComponent } from './chips.component';

const components = [
    ChipsComponent
];

@NgModule({
    imports: [
        CommonModule,
        SearchModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class ChipsModule {
}
