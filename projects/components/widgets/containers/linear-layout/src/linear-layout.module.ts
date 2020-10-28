import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { LinearLayoutDirective } from './linear-layout.directive';
import { LinearLayoutItemDirective } from './linear-layout-item/linear-layout-item.directive';

const components = [
    LinearLayoutDirective,
    LinearLayoutItemDirective
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
export class LinearLayoutModule {
}
