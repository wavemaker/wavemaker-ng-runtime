import { Directive, Inject, Self } from '@angular/core';

import { $invokeWatchers, $appDigest, AbstractDialogService, App, DataSource, extractCurrentItemExpr, triggerFn } from '@wm/core';
import { refreshDataSource } from '@wm/components/base';

import { TableComponent } from './table.component';

declare const $, _;

const OPERATION = {
    'NEW': 'new',
    'EDIT': 'edit',
    'DELETE': 'delete'
};

@Directive({
    selector: '[wmTableCUD]'
})
export class TableCUDDirective {

    constructor(
        @Self() @Inject(TableComponent) private table,
        private dialogService: AbstractDialogService,
        private  app: App
    ) {
        table.initiateSelectItem = this.initiateSelectItem.bind(this);
        table.updateVariable = this.updateVariable.bind(this);
        table.updateRecord = this.updateRecord.bind(this);
        table.deleteRecord = this.deleteRecord.bind(this);
        table.insertRecord = this.insertRecord.bind(this);
        table.editRow = this.editRow.bind(this);
        table.addNewRow = this.addNewRow.bind(this);
        table.addRow = this.addNewRow.bind(this);
        table.deleteRow = this.deleteRow.bind(this);
        table.onRecordDelete = this.onRecordDelete.bind(this);
        table.hideEditRow = this.hideEditRow.bind(this);
        table.saveRow = this.saveRow.bind(this);
        table.cancelRow = this.cancelRow.bind(this);
    }

    private selectItemOnSuccess(row, skipSelectItem, callBack) {
        /*$timeout is used so that by then $is.dataset has the updated value.
         * Selection of the item is done in the callback of page navigation so that the item that needs to be selected actually exists in the grid.*/
        /*Do not select the item if skip selection item is specified*/
        setTimeout(() => {
            if (!skipSelectItem) {
                this.table.selectItem(row, this.table.dataset);
            }
            triggerFn(callBack);
        }, 250);
    }

    initiateSelectItem(index, row, skipSelectItem?, isStaticVariable?, callBack?) {
        // In case of on demand pagination, when new row is inserted show it in the last page and continue with current flow instead of navigating user to the last page
        if (this.table.navigation === 'On-Demand' && !this.table.dataNavigator.isDisableNext && this.table.isNewRowInserted) {
            this.table.isNewRowInserted = false;
            return;
        }
        /*index === "last" indicates that an insert operation has been successfully performed and navigation to the last page is required.
         * Hence increment the "dataSize" by 1.*/
        if (index === 'last') {
            if (!isStaticVariable) {
                this.table.dataNavigator.dataSize += 1;
            }
            /*Update the data in the current page in the grid after insert/update operations.*/
            if (!this.table.isNavigationEnabled()) {
                index = 'current';
            }
        }
        /*Re-calculate the paging values like pageCount etc that could change due to change in the dataSize.*/
        this.table.dataNavigator.calculatePagingValues();
        /* updating pagination fulldata*/
        this.table.dataNavigator.__fullData = this.table.__fullData;
        this.table.dataNavigator.navigatePage(index, null, true, () => {
            if (this.table.isNavigationEnabled() || isStaticVariable) {
                this.selectItemOnSuccess(row, skipSelectItem, callBack);
            }
        });
    }

    updateVariable(row?, callBack?) {
        const dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }

        dataSource.execute(DataSource.Operation.FETCH_DISTINCT_VALUES);

        if (!this.table.isNavigationEnabled()) {
            const sortInfo = this.table.sortInfo;
            const sortOptions  = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
            refreshDataSource(dataSource, {
                page: 1,
                filterFields: this.table.getFilterFields(this.table.filterInfo),
                orderBy: sortOptions,
                matchMode: 'anywhereignorecase'
            }).then(() => {
                $appDigest();
                this.selectItemOnSuccess(row, true, callBack);
            });
        }
    }

    private insertSuccessHandler(response, options) {
        /*Display appropriate error message in case of error.*/
        if (response.error) {
            this.table.invokeEventCallback('error', {$event: options.event, $operation: OPERATION.NEW, $data: response.error});
            if (!this.table.onError) {
                this.table.toggleMessage(true, 'error', this.table.errormessage || response.error);
            }
            triggerFn(options.error, response);
        } else {
            if (this.table.navigation === 'On-Demand') {
                this.table.isNewRowInserted = true;
            }
            if (options.event) {
                const row = $(options.event.target).closest('tr');
                this.table.callDataGridMethod('hideRowEditMode', row);
            }
            if (!this.table.onRowinsert) {
                this.table.toggleMessage(true, 'success', this.table.insertmessage);
            }
            if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
                this.table.initiateSelectItem(this.table.getNavigationTargetBySortInfo(), response, undefined, false, options.callBack);
                this.updateVariable(response, options.callBack);
            } else if (!this.table.datasource.execute(DataSource.Operation.IS_API_AWARE)) {
                this.table.initiateSelectItem(this.table.getNavigationTargetBySortInfo(), response, undefined, false, options.callBack);
            }
            triggerFn(options.success, response);
            this.table.invokeEventCallback('rowinsert', {$event: options.event, $data: response, row: response});
        }
    }


    generatePath(binddataset) {
        let path, index;
        let dataBoundExpr = this.table.widget.$attrs.get('datasetboundexpr');
        if (_.startsWith(binddataset, 'item') && dataBoundExpr) {
            if (_.startsWith(dataBoundExpr, 'Widgets.')) {
                dataBoundExpr = extractCurrentItemExpr(dataBoundExpr, this.table);
            }
            const parentListItems = this.table.$element.parents('.app-list-item');
            const indexArr = _.map(parentListItems, (item) => _.parseInt($(item).attr('listitemindex')));
            for (let i = indexArr.length - 1; i >= 0; i--) {
                dataBoundExpr = dataBoundExpr.replace('$i', indexArr[i]);
            }
            index = _.last(indexArr);
            path = dataBoundExpr.replace(/^Variables\..*\.dataSet([^.])*(\.|$)/g, '');
        } else {
            // if we have dataset as "Variables.staticVar1.dataSet[1].details" then pass index as 1.
            const regEx = /^Variables\..*\.dataSet([\[][0-9]])/g;
            if (regEx.test(binddataset)) {
                index = _.parseInt(binddataset.replace(/^Variables\..*\.dataSet([\[])/g, ''));
            }
            path = binddataset.replace(/^Variables\..*\.dataSet([^.])*(\.|$)/g, '');
        }
        return { path, index };
    }

    insertRecord(options) {
        const dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        const currentPageNum = dataSource.pagination && dataSource.pagination.number + 1;
        const dataObject = {
            row : options.row,
            skipNotification : true,
            period: options.period
        };
        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD) || !dataSource.execute(DataSource.Operation.IS_API_AWARE) || dataSource.category === 'wm.CrudVariable') {
            if (!dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
                const extraOptions = this.generatePath(this.table.binddataset);
                dataSource.execute(DataSource.Operation.ADD_ITEM, {item: options.row, path: extraOptions.path, parentIndex: extraOptions.index});
                this.insertSuccessHandler(options.row, options);
                return;
            }
            dataSource.execute(DataSource.Operation.INSERT_RECORD, dataObject).then(response => {
                this.insertSuccessHandler(response, options);
                if (dataSource.category === 'wm.CrudVariable') {
                    dataSource.execute(DataSource.Operation.LIST_RECORDS, {
                        'skipToggleState': true,
                        'operation': 'list',
                        'page': currentPageNum
                    });
                }
            }, error => {
                this.table.invokeEventCallback('error', {$event: options.event, $operation: OPERATION.NEW, $data: error});
                if (!this.table.onError) {
                    this.table.toggleMessage(true, 'error', this.table.errormessage || error);
                }
                triggerFn(options.error, error);
                triggerFn(options.callBack, undefined, true);
            });
        } else {
            this.table.invokeEventCallback('rowinsert', {$event: options.event, row: options.row});
        }
    }

    private updateSuccessHandler(response, options) {
        /*Display appropriate error message in case of error.*/
        if (response.error) {
            this.table.invokeEventCallback('error', {$event: options.event, $operation: OPERATION.EDIT, $data: response.error});
            /*disable readonly and show the appropriate error*/
            if (!this.table.onError) {
                this.table.toggleMessage(true, 'error', this.table.errormessage || response.error);
            }
            triggerFn(options.error, response);
        } else {
            if (options.event) {
                const row = $(options.event.target).closest('tr');
                this.table.callDataGridMethod('hideRowEditMode', row);
            }
            if (!this.table.onRowupdate) {
                this.table.toggleMessage(true, 'success', this.table.updatemessage);
            }
            if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
                this.table.initiateSelectItem('current', response, undefined, false, options.callBack);
                this.updateVariable(response, options.callBack);
            } else if (!this.table.datasource.execute(DataSource.Operation.IS_API_AWARE)) {
                this.table.initiateSelectItem('current', response, undefined, false, options.callBack);
            }
            triggerFn(options.success, response);
            this.table.invokeEventCallback('rowupdate', {$event: options.event, $data: response, row: response});
        }
    }

    updateRecord(options) {
        const dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        const currentPageNum = dataSource.pagination && dataSource.pagination.number + 1;
        const dataObject = {
            row : options.row,
            prevData : options.prevData,
            skipNotification : true,
            period : options.period
        };

        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD) || !dataSource.execute(DataSource.Operation.IS_API_AWARE) || dataSource.category === 'wm.CrudVariable') {
            if (!dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
                const extraOptions = this.generatePath(this.table.binddataset);
                dataSource.execute(DataSource.Operation.SET_ITEM, {prevItem: options.prevData, item: options.row, path: extraOptions.path, parentIndex: extraOptions.index});
                this.updateSuccessHandler(options.row, options);
                return;
            }
            dataSource.execute(DataSource.Operation.UPDATE_RECORD, dataObject).then(response => {
                this.updateSuccessHandler(response, options);
                if (dataSource.category === 'wm.CrudVariable') {
                    dataSource.execute(DataSource.Operation.LIST_RECORDS, {
                        'skipToggleState': true,
                        'operation': 'list',
                        'page': currentPageNum
                    });
                }
            }, error => {
                this.table.invokeEventCallback('error', {$event: options.event, $operation: OPERATION.EDIT, $data: error});
                if (!this.table.onError) {
                    this.table.toggleMessage(true, 'error', this.table.errormessage || error);
                }
                triggerFn(options.error, error);
                triggerFn(options.callBack, undefined, true);
            });
        } else {
            this.table.invokeEventCallback('rowupdate', {$event: options.event, row: options.row});
        }
    }

    onRecordDelete(callBack?) {
        let index;
        /*Check for sanity*/
        if (this.table.dataNavigator) {
            this.table.dataNavigator.dataSize -= 1;
            this.table.dataNavigator.calculatePagingValues();
            /*If the current page does not contain any records due to deletion, then navigate to the previous page.*/
            index = this.table.dataNavigator.pageCount < this.table.dataNavigator.dn.currentPage ? 'prev' : undefined;
            /* updating pagination fulldata*/
            this.table.dataNavigator.__fullData = this.table.__fullData;
            this.table.dataNavigator.navigatePage(index, null, true, () => {
                setTimeout(() => {
                    triggerFn(callBack);
                }, undefined, false);
            });
        }
    }

    private deleteSuccessHandler(row, response?, evt?, callBack?) {
        /* check the response whether the data successfully deleted or not , if any error occurred show the
         * corresponding error , other wise remove the row from grid */
        if (response && response.error) {
            if (!this.table.onError) {
                this.table.toggleMessage(true, 'error', this.table.errormessage || response.error);
            }
            return;
        }
        this.onRecordDelete(callBack);
        if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
            this.updateVariable(row, callBack);
        }
        if (!this.table.onRowdelete) {
            this.table.toggleMessage(true, 'success', this.table.deletemessage);
        }
        // custom EventHandler for row deleted event
        this.table.invokeEventCallback('rowdelete', {$event: evt, $data: row, row});
        this.table.invokeEventCallback('rowdeleted', {$event: evt, $data: row, row});
    }

    private deleteFn(options) {
        const dataSource = this.table.datasource;
        let isLastPageElement, currentPageNum;
        if (!dataSource) {
            return;
        }
        // when delete operation is executed, turn on isRowDeleted flag to perform the next operations in table component
        if (this.table.onDemandLoad || this.table.infScroll) {
            this.table.isRowDeleted = true;
        }
        if (dataSource.category === 'wm.CrudVariable') {
            this.triggerWMEvent('resetEditMode');
            if (dataSource.pagination) {
                isLastPageElement = dataSource.pagination.last && dataSource.pagination.numberOfElements === 1;
                currentPageNum = isLastPageElement ? dataSource.pagination.number : dataSource.pagination.number + 1;
            }
        }
        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD) || !dataSource.execute(DataSource.Operation.IS_API_AWARE) || this.table._isDependent || dataSource.category === 'wm.CrudVariable') {
            if (!dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
                const extraOptions = this.generatePath(this.table.binddataset);
                dataSource.execute(DataSource.Operation.REMOVE_ITEM, {item: options.row, path: extraOptions.path, parentIndex: extraOptions.index});
                this.deleteSuccessHandler(options.row, undefined, options.evt, options.callBack);
                return;
            }
            dataSource.execute(DataSource.Operation.DELETE_RECORD, {
                row: options.row,
                skipNotification : true,
                period: options.period
            }).then(response => {
                this.deleteSuccessHandler(response, options.row, options.evt, options.callBack);
                if (dataSource.category === 'wm.CrudVariable') {
                    //this.triggerWMEvent('rerender', dataSource);
                    dataSource.execute(DataSource.Operation.LIST_RECORDS, {
                        'skipToggleState': true,
                        'operation': 'list',
                        'page': currentPageNum
                    });
                }
            }, error => {
                // In case of deletion failure, turn isRowDeleted flag off to prevent executing code in table comp
                if (this.table.isRowDeleted) {
                    this.table.isRowDeleted = false;
                }
                triggerFn(options.callBack, undefined, true);
                this.table.invokeEventCallback('error', {$event: options.evt, $operation: OPERATION.DELETE, $data: error});
                if (!this.table.onError) {
                    this.table.toggleMessage(true, 'error', this.table.errormessage || error);
                }
            });
        } else {
            this.table.invokeEventCallback('rowdelete', {$event: options.evt, row: options.row});
        }
        triggerFn(options.cancelRowDeleteCallback);
    }

    deleteRecord(options) {
        if (!this.table.confirmdelete) {
            this.deleteFn(options);
            triggerFn(options.cancelRowDeleteCallback);
            return;
        }
        this.dialogService.showAppConfirmDialog({
            title: this.app.appLocale.MESSAGE_DELETE_RECORD || 'Delete Record',
            iconclass: 'wi wi-delete fa-lg',
            message: this.table.confirmdelete,
            oktext: this.table.deleteoktext,
            canceltext: this.table.deletecanceltext,
            onOk: () => {
                this.deleteFn(options);
                this.dialogService.closeAppConfirmDialog();
            },
            onCancel: () => {
                triggerFn(options.cancelRowDeleteCallback);
                this.dialogService.closeAppConfirmDialog();
            },
            onOpen: () => {
                // Focus the cancel button on open
                $('.cancel-action').focus();
            },
            onEscape: () => {
                triggerFn(options.cancelRowDeleteCallback);
            }
        });
    }

    editRow(evt?) {
        let row;
        if (this.table._isDependent) {
            this.triggerWMEvent('update');
            return;
        }
        if (evt && evt.target) {
            this.table.callDataGridMethod('toggleEditRow', evt, {'selectRow': true, action: 'edit'});
        } else {
            // For live form, call the update function with selected item
            if (this.table.editmode === 'form' || this.table.editmode === 'dialog') {
                row = evt || this.table.selectedItems[0];
                this.table.gridOptions.beforeRowUpdate(row);
            } else {
                // Wait for the selected item to get updated
                setTimeout(() => {
                    row = this.table.datagridElement.find('tr.active');
                    if (row.length) {
                        this.table.callDataGridMethod('toggleEditRow', undefined, {$row: row, action: 'edit'});
                    }
                });
            }
        }
    }

    addNewRow() {
        if (!this.table.isGridEditMode) { // If grid is already in edit mode, do not add new row
            this.table.callDataGridMethod('addNewRow');
            if (this.table._liveTableParent) {
                this.table._liveTableParent.addNewRow();
            } else if (this.table._isDependent) {
                this.triggerWMEvent('insert');
                //this.table.callDataGridMethod('addNewRow');
            }
        }
    }

    private triggerWMEvent(eventName, dataSource?) {
        $invokeWatchers(true);
        this.app.notify('wm-event', {eventName, widgetName: this.table.name, row: this.table.selecteditem, dataSource: dataSource});
    }

    deleteRow(evt) {
        let row;
        if (evt && evt.target) {
            this.table.callDataGridMethod('deleteRowAndUpdateSelectAll', evt);
        } else {
            // Wait for the selected item to get updated
            setTimeout(() => {
                row = evt || this.table.selectedItems[0];
                this.deleteRecord({row});
            });
        }
    }

    // Function to hide the edited row
    hideEditRow() {
        const $row = this.table.datagridElement.find('tr.row-editing');
        if ($row.length) {
            this.table.callDataGridMethod('hideRowEditMode', $row);
        }
    }

    // Function to save the row
    saveRow() {
        this.table.callDataGridMethod('saveRow');
    }

    // Function to cancel the edit
    cancelRow() {
        const $row = this.table.datagridElement.find('tr.row-editing');
        if ($row.length) {
            this.table.callDataGridMethod('cancelEdit', $row);
        }
    }
}
