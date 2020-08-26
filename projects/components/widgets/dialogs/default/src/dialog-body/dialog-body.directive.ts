import { Directive, ElementRef, HostBinding, Inject } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';

import { addClass, setAttr, setCSS } from '@wm/core';

import { DialogRef } from '@wm/components/base';

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
            const height = this.dialogRef.height;
            if(height){
               setTimeout(e=>{
                    setCSS($(elRef.nativeElement)[0], 'height', height);
                });
            }      
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
