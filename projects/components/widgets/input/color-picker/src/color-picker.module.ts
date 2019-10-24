import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ColorPickerModule as ngxColorPickerModule } from 'ngx-color-picker';

import { WmComponentsModule } from '@wm/components/base';

import { ColorPickerComponent } from './color-picker.component';

const components = [
    ColorPickerComponent
];

@NgModule({
    imports: [
        CommonModule,
        ngxColorPickerModule,
        FormsModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class ColorPickerModule {
}
