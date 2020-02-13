import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { PrefabDirective } from './prefab.directive';
import { PrefabContainerDirective } from './prefab-container/prefab-container.directive';

const components = [
    PrefabDirective,
    PrefabContainerDirective
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
export class PrefabModule {
}
