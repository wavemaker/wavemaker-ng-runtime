import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { DialogModule } from '@wm/components/dialogs';
import { InputModule } from '@wm/components/input';

import { ConfirmDialogComponent } from './confirm-dialog.component';

const components = [
    ConfirmDialogComponent
];

@NgModule({
    imports:    [
        CommonModule,
        DialogModule,
        InputModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components]
})
export class ConfirmDialogModule {
}
