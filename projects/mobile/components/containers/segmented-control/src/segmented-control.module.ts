import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { SegmentedControlComponent } from './segmented-control.component';
import { SegmentContentComponent } from './segment-content/segment-content.component';

const components = [
    SegmentedControlComponent,
    SegmentContentComponent
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
export class SegmentedControlModule {
}
