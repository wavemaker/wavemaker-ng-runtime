import { Injectable, TemplateRef } from '@angular/core';
import { invokeEventHandler } from '../../utils/widget-utils';
import { BsModalService } from 'ngx-bootstrap';

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

    // Opens the dialog from the template reference provided
    openDialogFromTemplate(component, dialogId: string, template: TemplateRef<any>, dialogOptions?) {
        if (this.dialogInstances[dialogId] || !dialogId || !template) {
            return;
        }
        this.dialogInstances[dialogId] = component;
        component.bsModalRef = this.modalService.show(template, dialogOptions);
        if (!component.close) {
            component.close = () => {
                component.bsModalRef.hide();
                if (dialogOptions.onClose) {
                    dialogOptions.onClose();
                }
            };
        }
    }

    constructor(private modalService: BsModalService) {}
}
