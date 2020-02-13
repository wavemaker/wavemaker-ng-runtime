import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { DialogModule } from '@wm/components/dialogs';
import { InputModule } from '@wm/components/input';

import { PartialDialogComponent } from './partial-dialog.component';

const components = [
    PartialDialogComponent
];

@NgModule({
    imports: [
        CommonModule,
        DialogModule,
        InputModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class PartialDialogModule {
}
