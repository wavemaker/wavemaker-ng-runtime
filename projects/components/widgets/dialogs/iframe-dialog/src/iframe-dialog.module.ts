import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { BasicModule } from '@wm/components/basic';
import { DialogModule } from '@wm/components/dialogs';
import { InputModule } from '@wm/components/input';

import { IframeDialogComponent } from './iframe-dialog.component';

const components = [
    IframeDialogComponent
];

@NgModule({
    imports: [
        BasicModule,
        CommonModule,
        DialogModule,
        InputModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class IframeDialogModule {
}
