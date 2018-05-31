import { Directive, Inject, Self } from '@angular/core';

import { TableComponent } from './table.component';
import { DataSource, triggerFn } from '@wm/core';
import { refreshDataSource } from '../../../utils/data-utils';

const OPERATION = {
    'NEW': 'new',
    'EDIT': 'edit',
    'DELETE': 'delete'
};

@Directive({
    selector: '[wmTableCUD]'
})
export class TableCUDDirective {

    constructor(@Self() @Inject(TableComponent) private table) {
        table.updateVariable = this.updateVariable.bind(this);
        table.updateRecord = this.updateRecord.bind(this);
        table.deleteRecord = this.deleteRecord.bind(this);
        table.insertRecord = this.insertRecord.bind(this);
    }

    updateVariable(row?, callBack?) {
        const dataSource = this.table.datasource;
        // TODO: Filter
        // if (this.isBoundToFilter) {
        //     //If grid is bound to filter, call the apply fiter and update filter options
        //     if (!this.shownavigation) {
        //         refreshLiveFilter();
        //     }
        //     this.Widgets[this.widgetName].fetchDistinctValues();
        //     return;
        // }
        if (dataSource && !this.table.shownavigation) {
            refreshDataSource(dataSource, {
                page: 1
            }).then(() => {
                this.table.selectItemOnSuccess(row, true, callBack);
            });
        }
    }

    private insertSuccessHandler(response, options) {
        /*Display appropriate error message in case of error.*/
        if (response.error) {
            this.table.invokeEventCallback('error', {$event: options.event, $operation: OPERATION.NEW, $data: response.error});
            this.table.toggleMessage(true, 'error', this.table.errormessage || response.error);
            triggerFn(options.error, response);
        } else {
            if (options.event) {
                const row = $(options.event.target).closest('tr');
                this.table.callDataGridMethod('hideRowEditMode', row);
            }
            this.table.toggleMessage(true, 'success', this.table.insertmessage);
            if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
                this.table.initiateSelectItem(this.table.getNavigationTargetBySortInfo(), response, undefined, false, options.callBack);
                this.updateVariable(response, options.callBack);
            }
            triggerFn(options.success, response);
            this.table.invokeEventCallback('rowinsert', {$event: options.event, $data: response, $rowData: response});
        }
    }

    insertRecord(options) {
        const dataSource = this.table.datasource;
        const dataObject = {
            row : options.row,
            skipNotification : true
        };

        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD) || !dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
            if (!dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
                // variable.addItem(options.row); TODO
                this.insertSuccessHandler(options.row, options);
                return;
            }
            dataSource.execute(DataSource.Operation.INSERT_RECORD, dataObject).then(response => {
                this.insertSuccessHandler(response, options);
            }, error => {
                this.table.invokeEventCallback('error', {$event: options.event, $operation: OPERATION.NEW, $data: error});
                this.table.toggleMessage(true, 'error', this.table.errormessage || error);
                triggerFn(options.error, error);
                triggerFn(options.callBack, undefined, true);
            });
        } else {
            this.table.invokeEventCallback('rowinsert', {$event: options.event, $rowData: options.row});
        }
    }

    private updateSuccessHandler(response, options) {
        /*Display appropriate error message in case of error.*/
        if (response.error) {
            this.table.invokeEventCallback('error', {$event: options.event, $operation: OPERATION.EDIT, $data: response.error});
            /*disable readonly and show the appropriate error*/
            this.table.toggleMessage(true, 'error', this.table.errormessage || response.error);
            triggerFn(options.error, response);
        } else {
            if (options.event) {
                const row = $(options.event.target).closest('tr');
                this.table.callDataGridMethod('hideRowEditMode', row);
            }
            this.table.toggleMessage(true, 'success', this.table.updatemessage);
            if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
                this.table.initiateSelectItem('current', response, undefined, false, options.callBack);
                this.updateVariable(response, options.callBack);
            }
            triggerFn(options.success, response);
            this.table.invokeEventCallback('rowupdate', {$event: options.event, $data: response, $rowData: response});
        }
    }

    updateRecord(options) {
        const dataSource = this.table.datasource;
        const dataObject = {
            'row'              : options.row,
            'prevData'         : options.prevData,
            'skipNotification' : true
        };

        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD) || !dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
            if (!dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
                // datasource.execute.setItem(options.prevData, options.row); TODO: Set item on static variable
                // successHandler(options.row);
                return;
            }
            dataSource.execute(DataSource.Operation.UPDATE_RECORD, dataObject).then(response => {
                this.updateSuccessHandler(response, options);
            }, error => {
                this.table.invokeEventCallback('error', {$event: options.event, $operation: OPERATION.EDIT, $data: error});
                this.table.toggleMessage(true, 'error', this.table.errormessage || error);
                triggerFn(options.error, error);
                triggerFn(options.callBack, undefined, true);
            });
        } else {
            this.table.invokeEventCallback('rowupdate', {$event: options.event, $rowData: options.row});
        }
    }

    private deleteSuccessHandler(row, response?, evt?, callBack?) {
        /* check the response whether the data successfully deleted or not , if any error occurred show the
         * corresponding error , other wise remove the row from grid */
        if (response && response.error) {
            this.table.toggleMessage(true, 'error', this.table.errormessage || response.error);
            return;
        }
        this.table.onRecordDelete(callBack);
        if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
            this.updateVariable(row, callBack);
        }
        this.table.toggleMessage(true, 'success', this.table.deletemessage);
        // custom EventHandler for row deleted event
        this.table.invokeEventCallback('rowdelete', {$event: evt, $data: row, $rowData: row});
        this.table.invokeEventCallback('rowdeleted', {$event: evt, $data: row, $rowData: row});
    }

    private deleteFn(row, cancelRowDeleteCallback, evt, callBack) {
        const dataSource = this.table.datasource;

        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD) || !dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
            if (!dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
                // variable.removeItem(row); TODO: remove item on static variable
                this.deleteSuccessHandler(row, undefined, evt, callBack);
                return;
            }
            dataSource.execute(DataSource.Operation.UPDATE_RECORD, {
                row : row,
                skipNotification : true
            }).then(response => {
                this.deleteSuccessHandler(response, row, evt, callBack);
            }, error => {
                triggerFn(callBack, undefined, true);
                this.table.invokeEventCallback('error', {$event: evt, $operation: OPERATION.DELETE, $data: error});
                this.table.toggleMessage(true, 'error', this.table.errormessage || error);
            });
        } else {
            this.table.invokeEventCallback('rowdelete', {$event: evt, $rowData: row});
        }
        triggerFn(cancelRowDeleteCallback);
    }

    deleteRecord(row, cancelRowDeleteCallback, evt, callBack) {
        if (!this.table.confirmdelete) {
            this.deleteFn(row, cancelRowDeleteCallback, evt, callBack);
            triggerFn(cancelRowDeleteCallback);
            return;
        }
        // TODO: App confirm dialog
        // DialogService._showAppConfirmDialog({
        //     'caption'   : _.get(appLocale, 'MESSAGE_DELETE_RECORD') || 'Delete Record',
        //     'iconClass' : 'wi wi-delete fa-lg',
        //     'content'   : this.table.confirmdelete,
        //     'oktext'    : this.table.deleteoktext,
        //     'canceltext': this.table.deletecanceltext,
        //     'resolve'   : {
        //         'confirmActionOk': function () {
        //             return deleteFn;
        //         },
        //         'confirmActionCancel': function () {
        //             return function () {
        //                 triggerFn(cancelRowDeleteCallback);
        //             };
        //         }
        //     }
        // });
    }
}

