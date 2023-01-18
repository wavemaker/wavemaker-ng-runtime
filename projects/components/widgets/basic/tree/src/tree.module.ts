import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { TreeDirective } from './tree.directive';
import { TreeComponent } from './tree2.component';

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
