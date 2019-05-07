import { Injectable } from '@angular/core';

import { BaseDialog } from './base/base-dialog';

@Injectable()
export class DialogServiceImpl {

    /**
     * map which contains the references to all dialogs by name
     * @type {Map<any, any>}
     * Ex Map[[dialogName, [[dialogScope, dialogRef]]]]
     */
    private dialogRefsCollection = new Map<any, any>();

    constructor() {}

    /**
     * Register dialog by name and scope
     * @param {string} name
     * @param {BaseDialog} dialogRef
     * @param {scope}
     */
    public register(name: string, dialogRef: BaseDialog, scope: any) {
        if (!name) {
            return;
        }
        if (this.dialogRefsCollection.get(name)) {
            this.dialogRefsCollection.get(name).set(scope, dialogRef);
        } else {
            this.dialogRefsCollection.set(name, new Map([[scope, dialogRef]]));
        }
    }

    /**
     * De Register dialog by name and scope
     * @param name
     * @param dialogRef
     * @param scope
     */
    public deRegister(name: string, scope: any) {
        if (!name) {
            return;
        }
        if (this.dialogRefsCollection.get(name)) {
                this.dialogRefsCollection.get(name).delete(scope);
        }
    }

    private getDialogRef(name: string, scope?: any) {
        const dialofRefMap = this.dialogRefsCollection.get(name);
        let dialogRef;

        if (scope) {
            dialogRef = dialofRefMap.get(scope);
        } else {
            if (dialofRefMap.size === 1) {
                dialogRef = dialofRefMap.entries().next().value[1];
            } else {
                console.error("There are multiple instances of this dialog name. Please provide the Page/Partial/App instance in which the dialog exists.")
            }
        }
        return dialogRef;
    }

    /**
     * Opens the dialog with the given name
     * @param {string} name
     */
    public open(name: string, initState?: any, scope?: any) {
        let dialogRef = this.getDialogRef(name, scope);

        if (!dialogRef) {
            return;
        }

        dialogRef.open(initState);
    }

    /**
     * closes the dialog with the given name
     * @param {string} name
     */
    public close(name: string, scope?: any) {
        let dialogRef = this.getDialogRef(name, scope);

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
        this.dialogRefsCollection.forEach(dialogMap => {
           dialogMap.forEach(dialogRef => dialogRef.close());
        });
    }

    public showAppConfirmDialog(initState?: any) {
        this.open('_app-confirm-dialog', initState);
    }
}
