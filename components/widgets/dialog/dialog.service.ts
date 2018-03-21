import {Injectable} from '@angular/core';
import { invokeEventHandler } from '@components/utils/widget-utils';

declare const $;

@Injectable()
export class DialogService {
    private dialogInstances = {};

    private dialogIDCount = 0;

    getDialogInstance(dialogId) {
        return this.dialogInstances[dialogId] || {};
    }

    registerDialog(dialogId: string, component) {
        if (!dialogId) {
            dialogId = String(++this.dialogIDCount);
        }
        this.dialogInstances[dialogId] = component;
        this.assignInitMethods(component);
        return dialogId;
    }

    private assignInitMethods(component) {
        // assign open, close methods
        component.open = () => {
            component.onBeforeDialogOpen();
            component.bsModalRef = component.modalService.show(component.dialogTemplate, component.modalConfig);
            component.isOpen = true;
            invokeEventHandler(component, 'opened');
        };

        component.close = () => {
            component.bsModalRef.hide();
            component.isOpen = false;
            invokeEventHandler(component, 'hidden');
            invokeEventHandler(component, 'close');
        };
    }

    openDialog(dialogId: string, dialogParams?: any) {
        if (!this.dialogInstances[dialogId]) {
            return;
        }
        Object.assign(this.dialogInstances[dialogId], dialogParams);
        this.dialogInstances[dialogId].open();
    }

    closeDialog(dialogId: string) {
        if (!this.dialogInstances[dialogId]) {
            return;
        }
        this.dialogInstances[dialogId].close();
    }
}
