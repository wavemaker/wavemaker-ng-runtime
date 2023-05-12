import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { TreeComponent } from './tree.component';

const components = [
    TreeComponent
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
export class TreeModule {
}
