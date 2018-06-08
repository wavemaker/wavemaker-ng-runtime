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
    public open(name: string, initState?: any) {
        const dialogRef = this.dialogRefs.get(name);

        if (!dialogRef) {
            return;
        }

        dialogRef.open(initState);
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

    /**
     * closes all the opened dialogs
     */
    closeAllDialogs() {
        // close all the open dialogs
        this.dialogRefs.forEach(dialogRef => {
            dialogRef.close();
        });
    }

    public showAppConfirmDialog(initState?: any) {
        this.open('_app-confirm-dialog', initState);
    }
}
