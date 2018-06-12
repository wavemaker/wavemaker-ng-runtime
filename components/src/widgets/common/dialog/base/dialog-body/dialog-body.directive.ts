import { Directive, ElementRef, HostBinding, Inject } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap';

import { addClass, setCSS, toDimension } from '@wm/core';

import { DialogRef } from '../../../../framework/types';
import { BaseDialog } from '../base-dialog';

const DEFAULT_CLS = 'app-dialog-body modal-body';

@Directive({
    selector: 'div[wmDialogBody]',
})
export class DialogBodyDirective {
    @HostBinding('style.height')
    get height () {
        return toDimension((this.dialogRef as any).height);
    }

    constructor(
        elRef: ElementRef,
        @Inject(DialogRef) private dialogRef: BaseDialog,
        bsModal: BsModalService
    ) {
        addClass(elRef.nativeElement, DEFAULT_CLS);

        const subscription = bsModal.onShown.subscribe(() => {
            const dialogRoot = $(elRef.nativeElement).closest('.app-dialog')[0];
            const width = (this.dialogRef as any).width;
            if (dialogRoot && width) {
                setCSS(dialogRoot, 'width', width);
            }
            subscription.unsubscribe();
        });
    }
}