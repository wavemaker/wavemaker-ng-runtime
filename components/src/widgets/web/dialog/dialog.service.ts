import { Injectable, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap';

import { invokeEventHandler } from '../../../utils/widget-utils';

@Injectable()
export class DialogService {

    private dialogInstances: any = {};

    private dialogIDCount: number = 0;

    constructor(private modalService: BsModalService) {}

    public registerDialog(dialogId: string, component) {
        if (!dialogId) {
            dialogId = String(++this.dialogIDCount);
        }
        this.dialogInstances[dialogId] = component;
        this.assignInitMethods(component);
        return dialogId;
    }

    public openDialog(dialogId: string, dialogParams?: any) {
        if (!this.dialogInstances[dialogId]) {
            return;
        }
        Object.assign(this.dialogInstances[dialogId], dialogParams);
        this.dialogInstances[dialogId].open();
    }

    public closeDialog(dialogId: string) {
        if (!this.dialogInstances[dialogId]) {
            return;
        }
        this.dialogInstances[dialogId].close();
    }

    // Opens the dialog from the template reference provided
    public openDialogFromTemplate(component, dialogId: string, template: TemplateRef<any>, dialogOptions?) {
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

    public getDialogInstance(dialogId) {
        return this.dialogInstances[dialogId] || {};
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
}
