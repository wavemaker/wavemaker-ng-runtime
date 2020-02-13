import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { DialogModule } from '@wm/components/dialogs';
import { InputModule } from '@wm/components/input';

import { DialogComponent } from './dialog.component';

const components = [
    DialogComponent
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
export class DesignDialogModule {
}
