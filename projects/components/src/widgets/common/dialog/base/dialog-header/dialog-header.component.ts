import { Component, ElementRef, Inject, Input } from '@angular/core';

import { addClass, toBoolean } from '@wm/core';

import { DialogRef } from '../../../../framework/types';
import { BaseDialog } from '../base-dialog';

const DEFAULT_CLS = 'app-dialog-header modal-header';
const DEFAULT_ICON_DIMENSIONS = '21px';

@Component({
    selector: 'div[wmDialogHeader]',
    templateUrl: './dialog-header.component.html'
})
export class DialogHeaderComponent {

    @Input() public iconwidth = DEFAULT_ICON_DIMENSIONS;
    @Input() public iconheight = DEFAULT_ICON_DIMENSIONS;
    @Input() public iconmargin: string;
    @Input() public iconclass: string;
    @Input() public iconurl: string;
    @Input() public closable = true;
    @Input() public heading: string;
    @Input() public subheading: string;

    public get isClosable() {
        return toBoolean(this.closable);
    }

    constructor(elRef: ElementRef, @Inject(DialogRef) private dialogRef: BaseDialog) {
        addClass(elRef.nativeElement, DEFAULT_CLS);
    }

    public closeDialog() {
        this.dialogRef.close();
    }
}
