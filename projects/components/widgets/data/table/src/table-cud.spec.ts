import { TestBed } from '@angular/core/testing';
import { TableCUDDirective } from './table-cud.directive';
import { TableComponent } from './table.component';
import { AbstractDialogService, App } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

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
            } as any,
            gridOptions: {
                isNavTypeScrollOrOndemand: jest.fn(),
            } as any,
            dataNavigator: {
                isDisableNext: false,
                dataSize: 10,
                calculatePagingValues: jest.fn(),
                navigatePage: jest.fn(),
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
            $element: {
                parents: jest.fn().mockReturnValue([]),
            },
        } as any;

        mockDialogService = {
            showAppConfirmDialog: jest.fn(),
            closeAppConfirmDialog: jest.fn(),
        } as any;

        TestBed.configureTestingModule({
            providers: [
                TableCUDDirective,
                { provide: TableComponent, useValue: mockTable },
                { provide: AbstractDialogService, useValue: mockDialogService },
                { provide: App, useValue: mockApp },
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
});