import { Directive, ElementRef, HostBinding, Inject } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap';

import { addClass, setAttr, setCSS } from '@wm/core';

import { DialogRef } from '../../../../framework/types';

declare const $;

const DEFAULT_CLS = 'app-dialog-body modal-body';

@Directive({
    selector: 'div[wmDialogBody]',
})
export class DialogBodyDirective {
    @HostBinding('style.height') height;

    constructor(
        elRef: ElementRef,
        @Inject(DialogRef) private dialogRef,
        bsModal: BsModalService
    ) {
        addClass(elRef.nativeElement, DEFAULT_CLS);

        const subscription = bsModal.onShown.subscribe(() => {
            const dialogRoot = $(elRef.nativeElement).closest('.app-dialog')[0];
            const width = this.dialogRef.width;
            if (dialogRoot) {
                if (width) {
                    setCSS(dialogRoot, 'width', width);
                }
                setAttr(dialogRoot, 'tabindex', this.dialogRef.tabindex);
                setAttr(dialogRoot, 'name', this.dialogRef.name);

            }
            subscription.unsubscribe();
        });
    }
}
