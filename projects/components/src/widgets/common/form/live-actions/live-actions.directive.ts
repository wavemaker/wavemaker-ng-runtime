import { Directive, Inject, Self } from '@angular/core';

import { AbstractDialogService, App, DataSource, triggerFn } from '@wm/core';

import { ListComponent } from '../../list/list.component';
import { Live_Operations, performDataOperation } from '../../../../utils/data-utils';

@Directive({
    selector: '[wmLiveActions]'
})
export class LiveActionsDirective {

    constructor(
        @Self() @Inject(ListComponent) private subscribedWidget,
        private app: App,
        private dialogService: AbstractDialogService
    ) {
        subscribedWidget.addRow = this.addRow.bind(this);
        subscribedWidget.updateRow = this.updateRow.bind(this);
        subscribedWidget.deleteRow = this.deleteRow.bind(this);
        subscribedWidget.call = this.call.bind(this);
    }

    public addRow() {
        this.app.notify('wm-event', {eventName: Live_Operations.INSERT, widgetName: this.subscribedWidget.name, row: this.subscribedWidget.selecteditem});
    }

    public updateRow() {
        this.app.notify('wm-event', {eventName: Live_Operations.UPDATE, widgetName: this.subscribedWidget.name, row: this.subscribedWidget.selecteditem});
    }

    public deleteRow() {
        this.app.notify('wm-event', {eventName: Live_Operations.DELETE, widgetName: this.subscribedWidget.name, row: this.subscribedWidget.selecteditem});
    }

    private successHandler(options, response) {
        triggerFn(options.success, response);
    }

    private errorHandler(options, error) {
        this.app.notifyApp(error, 'error', 'ERROR');
        triggerFn(options.error, error);
    }

    public getRecords(options, operation) {
        let index;
        let dataNavigator;

        if (this.subscribedWidget.navigation !== 'None' && this.subscribedWidget.dataNavigator) {
            dataNavigator = this.subscribedWidget.dataNavigator;

            // If operation is delete, decrease the data size and check if navigation to previous page is required
            if (operation === Live_Operations.DELETE) {
                dataNavigator.dataSize -= 1;
                dataNavigator.calculatePagingValues();
                index = dataNavigator.pageCount < dataNavigator.dn.currentPage ? 'prev' : undefined;
            } else {
                // If operation is insert, go to last page. If update operation, stay on current page
                index = operation === Live_Operations.INSERT ? 'last' : 'current';
                if (index === 'last') {
                    dataNavigator.dataSize += 1;
                }
                dataNavigator.calculatePagingValues();
            }

            dataNavigator.navigatePage(index, null, true, response => {
                this.successHandler(options, response);
            });
        } else {
            this.subscribedWidget.datasource.execute(DataSource.Operation.LIST_RECORDS, {
                'skipToggleState': true
            }).then(response => {
                this.successHandler(options, response);
            }, err => {
                this.errorHandler(options, err);
            });
        }
    }

    private performCUDOperation(requestData, operation, options) {
        performDataOperation(this.subscribedWidget.datasource, requestData, {
            operationType: operation
        }).then(response => {
            if (response.error) {
                this.errorHandler(options, response.error);
                return;
            }
            this.getRecords(options, operation);
            // show delete success toaster
            if (operation === 'delete') {
                this.app.notifyApp(this.app.appLocale.MESSAGE_DELETE_RECORD_SUCCESS, 'success');
            }
        }, (error) => {
            this.errorHandler(options, error);
        });
    }

    private insertRecord(requestData, operation, options) {
        this.performCUDOperation(requestData, operation, options);
    }

    private updateRecord(requestData, operation, options) {
        this.performCUDOperation(requestData, operation, options);
    }

    private deleteRecord(requestData, operation, options) {
        // Show the delete confirmation dialog. On Ok, delete the record.
        this.dialogService.showAppConfirmDialog({
            title:  this.app.appLocale.MESSAGE_DELETE_RECORD || 'Delete Record',
            iconclass: 'wi wi-delete fa-lg',
            message: this.subscribedWidget.confirmdelete || 'Are you sure you want to delete this?',
            oktext: this.subscribedWidget.deleteoktext || 'Ok',
            canceltext: this.subscribedWidget.deletecanceltext || 'Cancel',
            onOk: () => {
                this.performCUDOperation(requestData, operation, options);
            },
            onCancel: () => {
                triggerFn(options.cancelDeleteCallback);
            }
        });
    }

    private performOperation(operation, options) {
        const requestData = {
            row: options.row,
            prevData: {},
            rowData: {},
            transform: true,
            skipNotification: true
        };

        if (operation === Live_Operations.UPDATE) {
            requestData.rowData = options.rowData;
            requestData.prevData = options.prevData;
        }

        /* decide routine based on CRUD operation to be performed */
        switch (operation) {
            case Live_Operations.INSERT:
                this.insertRecord(requestData, operation, options);
                break;
            case Live_Operations.UPDATE:
                this.updateRecord(requestData, operation, options);
                break;
            case Live_Operations.DELETE:
                this.deleteRecord(requestData, operation, options);
                break;
            case Live_Operations.READ:
                this.getRecords(options, operation);
                break;
        }
    }

    // API exposed to make CRUD operations
    public call(operation, options, success?, error?) {
        options.success = success;
        options.error = error;

        this.performOperation(operation, options);
    }
}
