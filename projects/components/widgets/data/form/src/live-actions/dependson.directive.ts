import { Directive, Attribute, ContentChildren, AfterContentInit, OnDestroy } from '@angular/core';

import { AbstractDialogService, App, DataSource } from '@wm/core';
import { Live_Operations } from '@wm/components/base';
import { FormComponent } from '../form.component';

@Directive({
    selector: '[dependson]'
})
export class DependsonDirective implements AfterContentInit, OnDestroy {

    @ContentChildren(FormComponent, {descendants: true}) formChildren;

    private dialogId;
    private dependson;
    private isLayoutDialog;
    private form;
    private editMode;
    private currentOp;
    private currentFormData;
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

    private onUpdate(newValue?, table?, editClicked?) {
        this.editMode = editClicked || this.editMode ;
        this.form.operationType = Live_Operations.UPDATE;
        this.form.isSelected = true;
        let rowData = this.currentFormData;
        if (newValue && table) {
            if (table.multiselect) {
                rowData = newValue[0];
            } else {
                rowData = newValue[newValue.length - 1];
            }
        }
        this.form.setFormData(rowData);
        this.form.edit();
        if (!this.editMode) {
            this.form.isUpdateMode = false;
        }
    }
    private onInsert() {
        this.form.operationType = Live_Operations.INSERT;
        this.form.isSelected = true;
        this.form.setFormData({});
        this.form.new();
    }

    private handleEvent(options) {
        if (this.dependson !== options.widgetName) {
            return;
        }
        this.currentOp = options.eventName;
        switch (options.eventName) {
            case Live_Operations.UPDATE:
                this.currentFormData = options.row;
                if (this.isLayoutDialog) {
                    this.openFormDialog();
                } else {
                    this.onUpdate(undefined,undefined, true);
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
                (<any>this.app).Widgets[this.dependson].call('delete', {row: options.row});
                break;
            case Live_Operations.READ:
                if (!this.isLayoutDialog) {
                    this.form.isUpdateMode = false;
                }
                break;
            case 'rerender':
                if (options.dataSource) {
                        options.dataSource.execute(DataSource.Operation.LIST_RECORDS, {
                            'skipToggleState': true,
                            'operation': 'list'
                        });
                }
                break;
            case 'selectedItemChange':
                if (options.table) {
                    this.onUpdate(options.row, options.table);
                }
                break;
            case 'resetEditMode':
                this.editMode = false;
        }
    }

    private onFormRender() {
        // On opening the form in dialog mode, complete the pending operations
        if (this.form && this.isLayoutDialog) {
            this.form.isLayoutDialog = true;
            setTimeout(() => {
                if (this.currentOp === Live_Operations.UPDATE) {
                    this.onUpdate(undefined, undefined, true);
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

        // find the dependent widget (table/list)
        this.app.notify('setup-cud-listener', this.dependson);
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
