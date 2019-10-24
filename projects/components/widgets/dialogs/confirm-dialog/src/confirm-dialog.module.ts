import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { InputModule } from '@wm/components/input';

import { ConfirmDialogComponent } from './confirm-dialog.component';

const components = [
    ConfirmDialogComponent
];

@NgModule({
    imports: [
        CommonModule,
        InputModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class ConfirmDialogModule {
}
