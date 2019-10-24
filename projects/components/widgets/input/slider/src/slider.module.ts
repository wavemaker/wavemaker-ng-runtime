import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WmComponentsModule } from '@wm/components/base';

import { SliderComponent } from './slider.component';

const components = [
    SliderComponent
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
export class SliderModule {
}
