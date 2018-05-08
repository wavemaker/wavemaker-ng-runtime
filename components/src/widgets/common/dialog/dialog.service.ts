import { Injectable } from '@angular/core';

import { BaseDialog } from './base/base-dialog';

@Injectable()
export class DialogService {

    /**
     * map which contains the references to all dialogs by name
     * @type {Map<string, BaseDialog>}
     */
    private dialogRefs = new Map<string, BaseDialog>();

    constructor() {}

    /**
     * Register dialog by name
     * @param {string} name
     * @param {BaseDialog} dialogRef
     */
    public register(name: string, dialogRef: BaseDialog) {
        if (!name) {
            return;
        }
        this.dialogRefs.set(name, dialogRef);
    }

    /**
     * Opens the dialog with the given name
     * @param {string} name
     */
    public open(name: string) {
        const dialogRef = this.dialogRefs.get(name);

        if (!dialogRef) {
            return;
        }

        dialogRef.open();
    }

    /**
     * closes the dialog with the given name
     * @param {string} name
     */
    public close(name: string) {
        const dialogRef = this.dialogRefs.get(name);

        if (!dialogRef) {
            return;
        }

        dialogRef.close();
    }
}
// Todo: Vinay - accept dialogParams for openDialog method
