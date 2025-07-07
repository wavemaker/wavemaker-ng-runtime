import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import {Component, ElementRef, Inject, Input} from '@angular/core';

import {addClass, toBoolean} from '@wm/core';

import {DialogRef} from '@wm/components/base';
import {BaseDialog} from '../base-dialog';

const DEFAULT_CLS = 'app-dialog-header modal-header';
const DEFAULT_ICON_DIMENSIONS = '21px';

@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule],
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
    @Input() public headinglevel?: string = 'h4';
    @Input() public subheading: string;
    @Input() public titleid:string;
    @Input() public title: string;
    @Input() public closehint: string;

    public get isClosable() {
        return toBoolean(this.closable);
    }

    constructor(elRef: ElementRef, @Inject(DialogRef) public dialogRef: BaseDialog ) {
        addClass(elRef.nativeElement, DEFAULT_CLS);
    }

    public closeDialog() {
        this.dialogRef.close();
    }
}
