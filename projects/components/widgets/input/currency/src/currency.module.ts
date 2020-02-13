import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WmComponentsModule } from '@wm/components/base';
import { InputModule } from '@wm/components/input';

import { CurrencyComponent } from './currency.component';

const components = [
    CurrencyComponent
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        InputModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class CurrencyModule {
}
