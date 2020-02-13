import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgCircleProgressModule } from 'ng-circle-progress';

import { WmComponentsModule } from '@wm/components/base';

import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ProgressCircleComponent } from './progress-circle/progress-circle.component';

const components = [
    ProgressBarComponent,
    ProgressCircleComponent
];

@NgModule({
    imports: [
        CommonModule,
        NgCircleProgressModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class ProgressModule {
}
