import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { TabsComponent } from './tabs.component';
import { TabPaneComponent } from './tab-pane/tab-pane.component';

const components = [
    TabPaneComponent,
    TabsComponent
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
export class TabsModule {
}
