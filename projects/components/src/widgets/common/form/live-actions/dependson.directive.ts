import { Directive, Attribute, ContentChildren, AfterContentInit, OnDestroy } from '@angular/core';

import { AbstractDialogService, App } from '@wm/core';

import { FormComponent } from '../form.component';
import { Live_Operations } from '../../../../utils/data-utils';

@Directive({
    selector: '[dependson]'
})
export class DependsonDirective implements AfterContentInit, OnDestroy {

    @ContentChildren(FormComponent, {descendants: true}) formChildren;

    private dialogId;
    private dependson;
    private isLayoutDialog;
    private form;
    private currentOp;
    private formSubscription;
    private eventSubscription;

    constructor(
        @Attribute('dialogid') dialogId: string,
        @Attribute('dependson') dependson: string,
        private dialogService: AbstractDialogService,
        private app: App
    ) {
        // If dialogId is present, form is in dialog mode
        if (dialogId) {
            this.isLayoutDialog = true;
            this.dialogId = dialogId;
        }
        this.dependson = dependson;
        // Listen to the wm-event called from subscribed widgets
        this.eventSubscription = this.app.subscribe('wm-event', this.handleEvent.bind(this));
    }

    private openFormDialog() {
        this.dialogService.open(this.dialogId);
    }

    private onUpdate() {
        this.form.operationType = Live_Operations.UPDATE;
        this.form.isSelected = true;
        this.form.edit();
    }

    private onInsert() {
        this.form.operationType = Live_Operations.INSERT;
        this.form.isSelected = true;
        this.form.new();
    }

    private handleEvent(options) {
        if (this.dependson !== options.widgetName) {
            return;
        }
        this.currentOp = options.eventName;
        switch (options.eventName) {
            case Live_Operations.UPDATE:
                if (this.isLayoutDialog) {
                    this.openFormDialog();
                } else {
                   this.onUpdate();
                }
                break;
            case Live_Operations.INSERT:
                if (this.isLayoutDialog) {
                    this.openFormDialog();
                } else {
                   this.onInsert();
                }
                break;
            case Live_Operations.DELETE:
               // If we have multiselect for the livelist(List with form template), in run mode deleting a record is getting failed. Becuase the row will be array of objects. So constructing dataobject.
                (<any>this.app).Widgets[this.dependson].call('delete', {row: this.form.constructDataObject()});
                break;
            case Live_Operations.READ:
                if (!this.isLayoutDialog) {
                    this.form.isUpdateMode = false;
                }
                break;
        }
    }

    private onFormRender() {
        // On opening the form in dialog mode, complete the pending operations
        if (this.form && this.isLayoutDialog) {
            setTimeout(() => {
                if (this.currentOp === Live_Operations.UPDATE) {
                    this.onUpdate();
                } else if (this.currentOp === Live_Operations.INSERT) {
                    this.onInsert();
                }
            }, 250);
        }
    }

    ngAfterContentInit() {
        // If form instance is present, form is in inline mode. Else, it is in dialog mode and listen to form instance changes
        if (this.formChildren.first) {
            this.form = this.formChildren.first;
        } else {
            this.formSubscription = this.formChildren.changes.subscribe((val) => {
                this.form = val.first;
                this.onFormRender();
            });
        }
    }

    ngOnDestroy() {
        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }
        if (this.eventSubscription) {
            this.eventSubscription();
        }
    }
}
