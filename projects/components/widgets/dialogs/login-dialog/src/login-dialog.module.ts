import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { DialogModule } from '@wm/components/dialogs';
import { DesignDialogModule } from '@wm/components/dialogs/design-dialog';
import { InputModule } from '@wm/components/input';

import { LoginDialogDirective } from './login-dialog.directive';

const components = [
    LoginDialogDirective
];

@NgModule({
    imports: [
        CommonModule,
        DesignDialogModule,
        DialogModule,
        InputModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components]
})
export class LoginDialogModule {
}
