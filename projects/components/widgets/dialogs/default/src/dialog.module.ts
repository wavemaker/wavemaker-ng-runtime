import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalModule } from 'ngx-bootstrap/modal';
import { WmComponentsModule } from '@wm/components/base';

import { DialogBodyDirective } from './dialog-body/dialog-body.directive';
import { DialogFooterDirective } from './dialog-footer/dialog-footer.directive';
import { DialogHeaderComponent } from './dialog-header/dialog-header.component';

const components = [
    DialogBodyDirective,
    DialogFooterDirective,
    DialogHeaderComponent
];

@NgModule({
    imports: [
        CommonModule,
        ModalModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class DialogModule {
}
