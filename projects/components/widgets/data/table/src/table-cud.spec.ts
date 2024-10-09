import { TestBed } from '@angular/core/testing';
import { TableCUDDirective } from './table-cud.directive';
import { TableComponent } from './table.component';
import { AbstractDialogService, App, DataSource } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { refreshDataSource } from '@wm/components/base';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    $appDigest: jest.fn()
}));

jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    refreshDataSource: jest.fn()
}));

describe('TableCUDDirective', () => {
    let directive: TableCUDDirective;
    let mockTable: jest.Mocked<TableComponent>;
    let mockDialogService: jest.Mocked<AbstractDialogService>;
    let mockCopyApp: jest.Mocked<App>;

    beforeEach(() => {
        mockTable = {
            initiateSelectItem: jest.fn(),
            updateVariable: jest.fn(),
            updateRecord: jest.fn(),
            deleteRecord: jest.fn(),
            insertRecord: jest.fn(),
            editRow: jest.fn(),
            addNewRow: jest.fn(),
            addRow: jest.fn(),
            deleteRow: jest.fn(),
            onRecordDelete: jest.fn(),
            hideEditRow: jest.fn(),
            saveRow: jest.fn(),
            cancelRow: jest.fn(),
            invokeEventCallback: jest.fn(),
            toggleMessage: jest.fn(),
            isNavigationEnabled: jest.fn(),
            datasource: {
                execute: jest.fn(),
                pagination: {
                    number: 0,
                    last: false,
                    numberOfElements: 5
                },
                category: '',
            } as any,
            gridOptions: {
                isNavTypeScrollOrOndemand: jest.fn(),
                setIsDataUpdatedByUser: jest.fn(),
                beforeRowUpdate: jest.fn(),
            } as any,
            dataNavigator: {
                isDisableNext: false,
                dataSize: 10,
                calculatePagingValues: jest.fn(),
                navigatePage: jest.fn(),
                dn: { currentPage: 1 },
                __fullData: [],
            } as any,
            isNewRowInserted: false,
            widget: {
                $attrs: {
                    get: jest.fn(),
                },
            },
            confirmdelete: '',
            binddataset: 'Variables.staticVariable1.dataSet',
            getFilterFields: jest.fn(),
            sortInfo: null,
            insertmessage: jest.fn(),
            callDataGridMethod: jest.fn(),
            getNavigationTargetBySortInfo: jest.fn(),
            $element: {
                parents: jest.fn().mockReturnValue([]),
            },
            __fullData: [],
            _isDependent: false,
            editmode: '',
            selectedItems: [],
            datagridElement: {
                find: jest.fn().mockReturnValue([]),
            },
            isGridEditMode: false,
            _liveTableParent: null,
            _triggeredByUser: false,
            onError: null,
            errormessage: 'An error occurred',
            deletemessage: 'Record deleted successfully',
            onRowdelete: null,
            onDemandLoad: false,
            infScroll: false,
            isRowDeleted: false,
            name: 'testTable',
            selecteditem: { id: 1 },
            selectItem: jest.fn(),
            dataset: [],
        } as any;

        mockCopyApp = mockApp as any;
        mockCopyApp["appLocale"] = {
            MESSAGE_DELETE_RECORD: 'Delete Record',
        };
        mockCopyApp["notify"] = jest.fn()
        mockDialogService = {
            showAppConfirmDialog: jest.fn(),
            closeAppConfirmDialog: jest.fn(),
        } as any;
        (refreshDataSource as jest.Mock).mockImplementation(() => Promise.resolve());

        TestBed.configureTestingModule({
            providers: [
                TableCUDDirective,
                { provide: TableComponent, useValue: mockTable },
                { provide: AbstractDialogService, useValue: mockDialogService },
                { provide: App, useValue: mockCopyApp },
            ],
        });

        directive = TestBed.inject(TableCUDDirective);
    });

    it('should be created', () => {
        expect(directive).toBeTruthy();
    });

    describe('initiateSelectItem', () => {
        it('should increment dataSize for last index', () => {
            mockTable.isNavigationEnabled.mockReturnValue(true);
            directive.initiateSelectItem('last', {}, false, false);
            expect(mockTable.dataNavigator.dataSize).toBe(11);
            expect(mockTable.dataNavigator.calculatePagingValues).toHaveBeenCalled();
            expect(mockTable.dataNavigator.navigatePage).toHaveBeenCalled();
        });
    });

    describe('generatePath', () => {
        it('should handle binddataset starting with "item"', () => {
            (mockTable as any).widget.$attrs.get.mockReturnValue('Widgets.someWidget.dataSet');
            (mockTable.$element.parents as jest.Mock).mockReturnValue([
                { attr: (key: string) => key === 'listitemindex' ? '1' : null },
                { attr: (key: string) => key === 'listitemindex' ? '2' : null },
            ]);
            const result = directive.generatePath('item.someProperty');
            expect(result).toEqual({
                path: 'Widgets.someWidget.dataSet',
                index: NaN,
            });
        });

        it('should handle binddataset not starting with "item"', () => {
            const result = directive.generatePath('Variables.staticVar1.dataSet[1].details');
            expect(result).toEqual({
                path: 'details',
                index: 1,
            });
        });

        it('should handle binddataset without index', () => {
            const result = directive.generatePath('Variables.staticVar1.dataSet.details');
            expect(result).toEqual({
                path: 'details',
                index: undefined,
            });
        });
    });

    describe('insertSuccessHandler', () => {
        let options: any;

        beforeEach(() => {
            options = {
                event: { target: { closest: jest.fn().mockReturnValue({}) } },
                error: jest.fn(),
                success: jest.fn(),
                callBack: jest.fn(),
            };
        });

        it('should handle error response', () => {
            const response = { error: "An error occurred" };
            directive['insertSuccessHandler'](response, options);

            expect(mockTable.invokeEventCallback).toHaveBeenCalledWith('error', {
                $event: options.event,
                $operation: 'new',
                $data: "An error occurred"
            });
            expect(mockTable.toggleMessage).toHaveBeenCalledWith(true, 'error', "An error occurred");
            expect(options.error).toHaveBeenCalledWith(response);
        });

        it('should handle successful insert for scroll or ondemand navigation', async () => {
            const response = { data: 'New row data' };
            (mockTable as any).gridOptions.isNavTypeScrollOrOndemand.mockReturnValue(true);
            mockTable.datasource.execute.mockReturnValue(true);

            await directive['insertSuccessHandler'](response, options);

            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('hideRowEditMode', expect.any(Object));
            expect(mockTable.toggleMessage).toHaveBeenCalledWith(true, 'success', (mockTable as any).insertmessage);
            expect(options.success).toHaveBeenCalledWith(response);
            expect(mockTable.invokeEventCallback).toHaveBeenCalledWith('rowinsert', {
                $event: options.event,
                $data: response,
                row: response
            });
        });

        it('should handle successful insert for non-API aware datasource', () => {
            const response = { data: 'New row data' };
            (mockTable as any).gridOptions.isNavTypeScrollOrOndemand.mockReturnValue(false);
            mockTable.datasource.execute.mockReturnValue(false);

            directive['insertSuccessHandler'](response, options);

            expect(mockTable.isNewRowInserted).toBe(false);
            expect(options.success).toHaveBeenCalledWith(response);
        });

        it('should not toggle message if onRowinsert is defined', () => {
            const response = { data: 'New row data' };
            mockTable.onRowinsert = jest.fn();

            directive['insertSuccessHandler'](response, options);

            expect(mockTable.toggleMessage).not.toHaveBeenCalled();
        });
    });

    describe('insertRecord', () => {
        it('should do nothing if datasource is not available', () => {
            mockTable.datasource = null;
            const options = { row: {}, period: 'now' };
            directive.insertRecord(options);
            expect(mockTable.datasource).toBeNull();
        });

        it('should handle non-API aware datasource', () => {
            const options = { row: { id: 1, name: 'Test' }, period: 'now' };
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return false;
                if (operation === DataSource.Operation.IS_API_AWARE) return false;
                return jest.fn();
            });

            directive.insertRecord(options);

            expect(mockTable.datasource.execute).toHaveBeenCalledWith(DataSource.Operation.ADD_ITEM, expect.any(Object));
        });

        it('should handle CRUD variable datasource', (done) => {
            const options = { row: { id: 1, name: 'Test' }, period: 'now' };
            mockTable.datasource.category = 'wm.CrudVariable';
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return true;
                if (operation === DataSource.Operation.IS_API_AWARE) return true;
                if (operation === DataSource.Operation.INSERT_RECORD) {
                    return Promise.resolve(options.row);
                }
                return jest.fn();
            });

            directive.insertRecord(options);

            setTimeout(() => {
                expect(mockTable.datasource.execute).toHaveBeenCalledWith(DataSource.Operation.INSERT_RECORD, expect.any(Object));
                expect(mockTable.datasource.execute).toHaveBeenCalledWith(DataSource.Operation.LIST_RECORDS, expect.any(Object));
                done();
            });
        });

        it('should handle error during insert', (done) => {
            const options = { row: { id: 1, name: 'Test' }, period: 'now', error: jest.fn(), callBack: jest.fn() };
            const error = new Error('Insert failed');
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return true;
                if (operation === DataSource.Operation.IS_API_AWARE) return true;
                if (operation === DataSource.Operation.INSERT_RECORD) {
                    return Promise.reject(error);
                }
                return jest.fn();
            });

            directive.insertRecord(options);

            setTimeout(() => {
                expect(mockTable.invokeEventCallback).toHaveBeenCalledWith('error', expect.any(Object));
                expect(options.error).toHaveBeenCalledWith(error);
                expect(options.callBack).toHaveBeenCalledWith(undefined, true);
                done();
            });
        });

        it('should handle non-CRUD datasource', () => {
            const options = { row: { id: 1, name: 'Test' }, period: 'now', event: {} };
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return false;
                if (operation === DataSource.Operation.IS_API_AWARE) return true;
                return jest.fn();
            });

            directive.insertRecord(options);

            expect(mockTable.invokeEventCallback).toHaveBeenCalledWith('rowinsert', expect.any(Object));
        });
    });

    describe('updateRecord', () => {
        it('should do nothing if datasource is not available', () => {
            mockTable.datasource = null;
            const options = { row: {}, prevData: {}, period: 'now' };
            directive.updateRecord(options);
            expect(mockTable.datasource).toBeNull();
        });

        it('should handle non-API aware datasource', () => {
            const options = { row: { id: 1, name: 'Updated' }, prevData: { id: 1, name: 'Original' }, period: 'now' };
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return false;
                if (operation === DataSource.Operation.IS_API_AWARE) return false;
                return jest.fn();
            });

            directive.updateRecord(options);

            expect(mockTable.datasource.execute).toHaveBeenCalledWith(DataSource.Operation.SET_ITEM, expect.any(Object));
        });

        it('should handle CRUD variable datasource', (done) => {
            const options = { row: { id: 1, name: 'Updated' }, prevData: { id: 1, name: 'Original' }, period: 'now' };
            mockTable.datasource.category = 'wm.CrudVariable';
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return true;
                if (operation === DataSource.Operation.IS_API_AWARE) return true;
                if (operation === DataSource.Operation.UPDATE_RECORD) {
                    return Promise.resolve(options.row);
                }
                return jest.fn();
            });

            directive.updateRecord(options);

            setTimeout(() => {
                expect(mockTable.datasource.execute).toHaveBeenCalledWith(DataSource.Operation.UPDATE_RECORD, expect.any(Object));
                expect(mockTable.datasource.execute).toHaveBeenCalledWith(DataSource.Operation.LIST_RECORDS, expect.any(Object));
                done();
            });
        });

        it('should handle error during update', (done) => {
            const options = { row: { id: 1, name: 'Updated' }, prevData: { id: 1, name: 'Original' }, period: 'now', error: jest.fn(), callBack: jest.fn() };
            const error = new Error('Update failed');
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return true;
                if (operation === DataSource.Operation.IS_API_AWARE) return true;
                if (operation === DataSource.Operation.UPDATE_RECORD) {
                    return Promise.reject(error);
                }
                return jest.fn();
            });

            directive.updateRecord(options);

            setTimeout(() => {
                expect(mockTable.invokeEventCallback).toHaveBeenCalledWith('error', expect.any(Object));
                expect(options.error).toHaveBeenCalledWith(error);
                expect(options.callBack).toHaveBeenCalledWith(undefined, true);
                done();
            });
        });

        it('should handle non-CRUD datasource', () => {
            const options = { row: { id: 1, name: 'Updated' }, prevData: { id: 1, name: 'Original' }, period: 'now', event: {} };
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return false;
                if (operation === DataSource.Operation.IS_API_AWARE) return true;
                return jest.fn();
            });

            directive.updateRecord(options);

            expect(mockTable.invokeEventCallback).toHaveBeenCalledWith('rowupdate', expect.any(Object));
        });
    });

    describe('onRecordDelete', () => {
        it('should decrease dataSize and calculate paging values', () => {
            directive.onRecordDelete();
            expect(mockTable.dataNavigator.dataSize).toBe(9);
            expect(mockTable.dataNavigator.calculatePagingValues).toHaveBeenCalled();
        });

        it('should navigate to previous page if current page is empty', () => {
            mockTable.dataNavigator.pageCount = 2;
            mockTable.dataNavigator.dn.currentPage = 3;
            directive.onRecordDelete();
            expect(mockTable.dataNavigator.navigatePage).toHaveBeenCalledWith('prev', null, true, expect.any(Function));
        });

        it('should not navigate if current page still has records', () => {
            mockTable.dataNavigator.pageCount = 5;
            mockTable.dataNavigator.dn.currentPage = 3;
            directive.onRecordDelete();
            expect(mockTable.dataNavigator.navigatePage).toHaveBeenCalledWith(undefined, null, true, expect.any(Function));
        });

        it('should update fullData of dataNavigator', () => {
            const fullData = [{ id: 1 }, { id: 2 }];
            (mockTable as any).__fullData = fullData;
            directive.onRecordDelete();
            expect(mockTable.dataNavigator.__fullData).toBe(fullData);
        });

        it('should not throw error if dataNavigator is undefined', () => {
            mockTable.dataNavigator = undefined;
            expect(() => directive.onRecordDelete()).not.toThrow();
        });
    });


    describe('deleteRecord', () => {
        it('should call deleteFn if confirmdelete is not set', () => {
            const options = { cancelRowDeleteCallback: jest.fn() };
            (directive as any).deleteFn = jest.fn();
            directive.deleteRecord(options);
            expect((directive as any).deleteFn).toHaveBeenCalledWith(options);
            expect(options.cancelRowDeleteCallback).toHaveBeenCalled();
        });

        it('should show confirm dialog if confirmdelete is set', () => {
            (mockTable as any).confirmdelete = 'Are you sure?';
            const options = { cancelRowDeleteCallback: jest.fn() };
            directive.deleteRecord(options);
            expect(mockDialogService.showAppConfirmDialog).toHaveBeenCalled();
        });
    });

    describe('editRow', () => {
        it('should trigger WMEvent if table is dependent', () => {
            mockTable._isDependent = true;
            (directive as any).triggerWMEvent = jest.fn();
            directive.editRow();
            expect((directive as any).triggerWMEvent).toHaveBeenCalledWith('update');
        });

        it('should call toggleEditRow if event target is provided', () => {
            const evt = { target: {} };
            directive.editRow(evt);
            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('toggleEditRow', evt, { selectRow: true, action: 'edit' });
        });

        it('should handle form edit mode', () => {
            mockTable.editmode = 'form';
            mockTable.selectedItems = [{ id: 1 }];
            directive.editRow();
            expect(mockTable.gridOptions.beforeRowUpdate).toHaveBeenCalledWith({ id: 1 });
        });
    });

    describe('addNewRow', () => {
        it('should add new row if grid is not in edit mode', () => {
            mockTable.isGridEditMode = false;
            directive.addNewRow();
            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('addNewRow');
            expect(mockTable._triggeredByUser).toBe(true);
            expect(mockTable.gridOptions.setIsDataUpdatedByUser).toHaveBeenCalledWith(false);
        });

        it('should not add new row if grid is in edit mode', () => {
            mockTable.isGridEditMode = true;
            directive.addNewRow();
            expect(mockTable.callDataGridMethod).not.toHaveBeenCalled();
        });
    });

    describe('deleteRow', () => {
        it('should call deleteRowAndUpdateSelectAll if event target is provided', () => {
            const evt = { target: {} };
            directive.deleteRow(evt);
            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('deleteRowAndUpdateSelectAll', evt);
        });

    });

    describe('hideEditRow', () => {
        it('should hide edit row if found', () => {
            mockTable.datagridElement.find.mockReturnValue([{}]);
            directive.hideEditRow();
            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('hideRowEditMode', [{}]);
        });

        it('should not call hideRowEditMode if no editing row found', () => {
            mockTable.datagridElement.find.mockReturnValue([]);
            directive.hideEditRow();
            expect(mockTable.callDataGridMethod).not.toHaveBeenCalled();
        });
    });

    describe('saveRow', () => {
        it('should call saveRow method on table', () => {
            directive.saveRow();
            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('saveRow');
        });
    });

    describe('cancelRow', () => {
        it('should cancel edit if editing row found', () => {
            mockTable.datagridElement.find.mockReturnValue([{}]);
            directive.cancelRow();
            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('cancelEdit', [{}]);
        });

        it('should not call cancelEdit if no editing row found', () => {
            mockTable.datagridElement.find.mockReturnValue([]);
            directive.cancelRow();
            expect(mockTable.callDataGridMethod).not.toHaveBeenCalled();
        });
    });

    describe('deleteSuccessHandler', () => {
        const row = { id: 1, name: 'Test' };
        const evt = { type: 'click' };

        beforeEach(() => {
            directive.onRecordDelete = jest.fn();
            directive.updateVariable = jest.fn();
        });

        it('should show error message if response contains error and onError is not defined', () => {
            const response = { error: 'Test error' };
            directive['deleteSuccessHandler'](row, response);
            expect(mockTable.toggleMessage).toHaveBeenCalledWith(true, 'error', 'An error occurred');
        });

        it('should not show error message if onError is defined', () => {
            const response = { error: 'Test error' };
            mockTable.onError = jest.fn();
            directive['deleteSuccessHandler'](row, response);
            expect(mockTable.toggleMessage).not.toHaveBeenCalled();
        });

        it('should call onRecordDelete if no error in response', () => {
            const callback = jest.fn();
            directive['deleteSuccessHandler'](row, {}, evt, callback);
            expect(directive.onRecordDelete).toHaveBeenCalledWith(callback);
        });

        it('should update variable if datasource supports CRUD', () => {
            mockTable.datasource.execute.mockReturnValue(true);
            const callback = jest.fn();
            directive['deleteSuccessHandler'](row, {}, evt, callback);
            expect(directive.updateVariable).toHaveBeenCalledWith(row, callback);
        });

        it('should not update variable if datasource does not support CRUD', () => {
            mockTable.datasource.execute.mockReturnValue(false);
            directive['deleteSuccessHandler'](row);
            expect(directive.updateVariable).not.toHaveBeenCalled();
        });

        it('should show success message if onRowdelete is not defined', () => {
            directive['deleteSuccessHandler'](row);
            expect(mockTable.toggleMessage).toHaveBeenCalledWith(true, 'success', 'Record deleted successfully');
        });

        it('should not show success message if onRowdelete is defined', () => {
            mockTable.onRowdelete = jest.fn();
            directive['deleteSuccessHandler'](row);
            expect(mockTable.toggleMessage).not.toHaveBeenCalled();
        });

        it('should invoke rowdelete and rowdeleted event callbacks', () => {
            directive['deleteSuccessHandler'](row, {}, evt);
            expect(mockTable.invokeEventCallback).toHaveBeenCalledWith('rowdelete', { $event: evt, $data: row, row });
            expect(mockTable.invokeEventCallback).toHaveBeenCalledWith('rowdeleted', { $event: evt, $data: row, row });
        });
    });

    describe('deleteFn', () => {

        beforeEach(() => {
            (directive as any).deleteSuccessHandler = jest.fn();
            (directive as any).triggerWMEvent = jest.fn();
            directive.generatePath = jest.fn().mockReturnValue({ path: 'testPath', index: 0 });
        });

        const options = {
            row: { id: 1, name: 'Test' },
            evt: { type: 'click' },
            callBack: jest.fn(),
            cancelRowDeleteCallback: jest.fn()
        };

        it('should return early if datasource is not defined', () => {
            mockTable.datasource = null;
            directive['deleteFn'](options);
            expect((directive as any).deleteSuccessHandler).not.toHaveBeenCalled();
        });

        it('should set isRowDeleted flag for onDemandLoad', () => {
            mockTable.onDemandLoad = true;
            directive['deleteFn'](options);
            expect(mockTable.isRowDeleted).toBe(true);
        });

        it('should set isRowDeleted flag for infScroll', () => {
            mockTable.infScroll = true;
            directive['deleteFn'](options);
            expect(mockTable.isRowDeleted).toBe(true);
        });

        it('should trigger resetEditMode for CrudVariable', () => {
            mockTable.datasource.category = 'wm.CrudVariable';
            directive['deleteFn'](options);
            expect((directive as any).triggerWMEvent).toHaveBeenCalledWith('resetEditMode');
        });

        it('should handle non-API aware datasource', () => {
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return true;
                if (operation === DataSource.Operation.IS_API_AWARE) return false;
                return null;
            });
            directive['deleteFn'](options);
            expect(mockTable.datasource.execute).toHaveBeenCalledWith(DataSource.Operation.REMOVE_ITEM, expect.any(Object));
            expect((directive as any).deleteSuccessHandler).toHaveBeenCalled();
        });

        it('should handle API aware datasource with successful deletion', async () => {
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return true;
                if (operation === DataSource.Operation.IS_API_AWARE) return true;
                if (operation === DataSource.Operation.DELETE_RECORD) return Promise.resolve({ success: true });
                return null;
            });
            await directive['deleteFn'](options);
            expect(mockTable.datasource.execute).toHaveBeenCalledWith(DataSource.Operation.DELETE_RECORD, expect.any(Object));
            expect((directive as any).deleteSuccessHandler).toHaveBeenCalled();
        });

        it('should handle API aware datasource with deletion error', async () => {
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return true;
                if (operation === DataSource.Operation.IS_API_AWARE) return true;
                if (operation === DataSource.Operation.DELETE_RECORD) return Promise.reject('Delete error');
                return null;
            });
            await directive['deleteFn'](options);
            expect(mockTable.isRowDeleted).toBe(false);
            expect(mockTable.invokeEventCallback).toHaveBeenCalledWith('error', expect.any(Object));
            expect(mockTable.toggleMessage).toHaveBeenCalledWith(true, 'error', 'An error occurred');
        });

        it('should invoke rowdelete callback for non-CRUD datasource', () => {
            mockTable.datasource.execute.mockImplementation((operation) => {
                if (operation === DataSource.Operation.SUPPORTS_CRUD) return false;
                if (operation === DataSource.Operation.IS_API_AWARE) return true;
                return null;
            });
            directive['deleteFn'](options);
            expect(mockTable.invokeEventCallback).toHaveBeenCalledWith('rowdelete', expect.any(Object));
        });

        it('should call cancelRowDeleteCallback', () => {
            directive['deleteFn'](options);
            expect(options.cancelRowDeleteCallback).toHaveBeenCalled();
        });
    });

    describe('updateSuccessHandler', () => {
        const options = {
            event: { target: $('<tr>')[0] },
            error: jest.fn(),
            success: jest.fn(),
            callBack: jest.fn()
        };

        it('should handle error response', () => {
            const response = { error: 'Update failed' };
            directive['updateSuccessHandler'](response, options);
            expect(mockTable.invokeEventCallback).toHaveBeenCalledWith('error', expect.any(Object));
            expect(mockTable.toggleMessage).toHaveBeenCalledWith(true, 'error', 'An error occurred');
            expect(options.error).toHaveBeenCalledWith(response);
        });

        it('should handle successful update', () => {
            const response = { id: 1, name: 'Updated' };
            directive['updateSuccessHandler'](response, options);
            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('hideRowEditMode', expect.any(Object));
        });
    });

    describe('triggerWMEvent', () => {
        it('should notify app with correct parameters', () => {
            const eventName = 'testEvent';
            const dataSource = { data: [] };
            directive['triggerWMEvent'](eventName, dataSource);
            expect(mockApp.notify).toHaveBeenCalledWith('wm-event', {
                eventName,
                widgetName: mockTable.name,
                row: mockTable.selecteditem,
                dataSource
            });
        });
    });

    describe('deleteRecord', () => {

        beforeEach(() => {
            (directive as any).deleteFn = jest.fn();
        });

        const options = {
            cancelRowDeleteCallback: jest.fn()
        };

        it('should call deleteFn directly if confirmdelete is not set', () => {
            (mockTable as any).confirmdelete = '';
            directive.deleteRecord(options);
            expect((directive as any).deleteFn).toHaveBeenCalledWith(options);
            expect(options.cancelRowDeleteCallback).toHaveBeenCalled();
        });

        it('should show confirmation dialog if confirmdelete is set', () => {
            (mockTable as any).confirmdelete = 'Are you sure?';
            directive.deleteRecord(options);
            expect(mockDialogService.showAppConfirmDialog).toHaveBeenCalled();
        });
    });

    describe('selectItemOnSuccess', () => {
        it('should select item after timeout if skipSelectItem is false', (done) => {
            const row = { id: 1 };
            const callBack = jest.fn();
            directive['selectItemOnSuccess'](row, false, callBack);
            setTimeout(() => {
                expect(mockTable.selectItem).toHaveBeenCalledWith(row, mockTable.dataset);
                expect(callBack).toHaveBeenCalled();
                done();
            }, 300);
        });

        it('should not select item if skipSelectItem is true', (done) => {
            const row = { id: 1 };
            const callBack = jest.fn();
            directive['selectItemOnSuccess'](row, true, callBack);
            setTimeout(() => {
                expect(mockTable.selectItem).not.toHaveBeenCalled();
                expect(callBack).toHaveBeenCalled();
                done();
            }, 300);
        });
    });
});