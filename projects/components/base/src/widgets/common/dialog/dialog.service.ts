import { Injectable } from '@angular/core';

const openedDialogs = [];
/*We need closedDialogs array because onHidden event is asynchronous,
and if the user uses script and calls dialog1.close() and then dialog2.close() then
we cannot be sure if both the dialogs onClose callback will be called or not.*/
const closeDialogsArray = [];

declare const _;

@Injectable()
export class DialogServiceImpl {

    /**
     * map which contains the references to all dialogs by name
     * @type {Map<any, any>}
     * Ex Map[[dialogName, [[dialogScope, dialogRef]]]]
     */
    private dialogRefsCollection = new Map<any, any>();
    private appConfirmDialog = '_app-confirm-dialog';

    constructor() {}

    /**
     * Register dialog by name and scope
     * @param {string} name
     * @param {BaseDialog} dialogRef
     * @param {scope}
     */
    public register(name: string, dialogRef: any, scope: any) {
        if (!name) {
            return;
        }
        if (this.dialogRefsCollection.get(name)) {
            this.dialogRefsCollection.get(name).set(scope, dialogRef);
        } else {
            this.dialogRefsCollection.set(name, new Map([[scope, dialogRef]]));
        }
    }

    public getDialogRefsCollection() {
        return this.dialogRefsCollection;
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
        const dialogRefMap = this.dialogRefsCollection.get(name);
        let dialogRef;

        if (scope) {
            dialogRef = dialogRefMap.get(scope);
            if (!dialogRef) {
                // Check if the scope is App level scope
                // else throw a console error
                if (!scope.pageName && !scope.partialName && !scope.prefabName) {
                    dialogRefMap.forEach((dRef, dialogScope) => {
                        // Check if the collection of dialogs have a "common" partial scope
                        // If yes use that else through a console error
                        if (dialogScope && dialogScope.partialName === 'Common') {
                            dialogRef = dRef;
                        } else {
                            console.error('No dialog with the name "' + name + '" found in the App scope.');
                        }
                    });
                } else {
                    console.error('No dialog with the name "' + name + '" found in the given scope.');
                }
            }
        } else {
            if (dialogRefMap.size === 1) {
                dialogRef = dialogRefMap.entries().next().value[1];
            } else {
                console.error('There are multiple instances of this dialog name. Please provide the Page/Partial/App instance in which the dialog exists.');
            }
        }
        return dialogRef;
    }

    /**
     * Opens the dialog with the given name
     * @param {string} name
     */
    public open(name: string, scope?: any, initState?: any) {
        const dialogRef = this.getDialogRef(name, scope);
        if (!dialogRef) {
            return;
        }

        dialogRef.open(initState);
    }

    /**
     * closes the dialog with the given name
     * @param {string} name
     */
    public close(name: string, scope?: any, callBackFn?:any) {
        const dialogRef = this.getDialogRef(name, scope);
        if (!dialogRef) {
            return;
        }
        // For notification action variable dialogs onok callback event should be called after closing the dialog.
        // So passing it as callback function
        dialogRef.closeCallBackFn = callBackFn;
        dialogRef.close();
    }

    /**
     * closes all the opened dialogs
     */
    closeAllDialogs() {
        _.forEach(openedDialogs.reverse(), (dialog) => {
            dialog.close();
        });
    }

    public showAppConfirmDialog(initState?: any) {
        this.open(this.getAppConfirmDialog(), undefined, initState);
    }

    public closeAppConfirmDialog() {
        this.close(this.getAppConfirmDialog());
    }

    public getAppConfirmDialog() {
        return this.appConfirmDialog;
    }

    public setAppConfirmDialog(dialogName: string) {
        this.appConfirmDialog = dialogName;
    }

    public addToOpenedDialogs(ref) {
        openedDialogs.push(ref);
    }

    public getLastOpenedDialog() {
        return openedDialogs[openedDialogs.length - 1];
    }

    public removeFromOpenedDialogs(ref) {
        if (openedDialogs.indexOf(ref) !== -1) {
            openedDialogs.splice(openedDialogs.indexOf(ref), 1);
        }
    }

    public getOpenedDialogs() {
        return openedDialogs;
    }

    public addToClosedDialogs(ref) {
        closeDialogsArray.push(ref);
    }

    public removeFromClosedDialogs(ref) {
        if (closeDialogsArray.indexOf(ref) !== -1) {
            closeDialogsArray.splice(closeDialogsArray.indexOf(ref), 1);
        }
    }

    public getDialogRefFromClosedDialogs() {
        return closeDialogsArray[closeDialogsArray.length - 1];
    }
}
