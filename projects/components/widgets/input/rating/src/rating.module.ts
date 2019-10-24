import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WmComponentsModule } from '@wm/components/base';

import { RatingComponent } from './rating.component';

const components = [
    RatingComponent
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class RatingModule {
}
