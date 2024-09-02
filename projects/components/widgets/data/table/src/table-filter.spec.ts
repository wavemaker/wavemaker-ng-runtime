import { getClonedObject } from '@wm/core';
import { TableFilterSortDirective } from './table-filter.directive';
import { TableComponent } from './table.component';
import { refreshDataSource } from '@wm/components/base';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    getClonedObject: jest.fn(),
}));

jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    refreshDataSource: jest.fn(),
}));

describe('TableFilterSortDirective', () => {
    let directive: TableFilterSortDirective;
    let tableComponent: TableComponent;

    beforeEach(() => {
        tableComponent = {
            _searchSortHandler: jest.fn(),
            getSearchResult: jest.fn(),
            getSortResult: jest.fn(),
            checkFiltersApplied: jest.fn(),
            getFilterFields: jest.fn(),
            onRowFilterChange: jest.fn(),
            onFilterConditionSelect: jest.fn(),
            showClearIcon: jest.fn(),
            clearRowFilter: jest.fn(),
            matchModeTypesMap: {},
            matchModeMsgs: {},
            emptyMatchModes: [],
            getNavigationTargetBySortInfo: jest.fn(),
            refreshData: jest.fn(),
            clearFilter: jest.fn(),
            adjustContainer: jest.fn(),
            appLocale: 'en',
            columns: {},
            filterInfo: {},
            rowFilterCompliedTl: {},
            datagridElement: {
                find: jest.fn().mockReturnValue({
                    val: jest.fn(),
                    trigger: jest.fn(),
                    show: jest.fn(),
                    hide: jest.fn(),
                }),
            },
            dataset: [],
            serverData: [],
            gridData: [],
            callDataGridMethod: jest.fn(),
            isNavigationEnabled: jest.fn().mockReturnValue(false),
            setGridData: jest.fn(),
            toggleMessage: jest.fn(),
            selecteditem: undefined,
            gridfirstrowselect: false,
            multiselect: false,
            dataNavigator: {
                dn: { currentPage: 1 },
                setPagingValues: jest.fn(),
            },
            invokeEventCallback: jest.fn(),
            statePersistence: {
                removeWidgetState: jest.fn(),
                setWidgetState: jest.fn(),
                getConfiguredState: jest.fn().mockReturnValue('none'),
            },
            getConfiguredState: jest.fn().mockReturnValue('none'),
            filtermode: 'search',
            navigation: 'pagination',
            sortInfo: {},
            primaryKey: [],
            datasource: {
                execute: jest.fn()
                    .mockReturnValueOnce({ filterFields: {} }) // For SUPPORTS_SERVER_FILTER
                    .mockReturnValueOnce({ filterFields: {} }) // For GET_OPTIONS
                    .mockReturnValueOnce(true) // For SUPPORTS_SERVER_FILTER
                    .mockReturnValueOnce(false) // For IS_PAGEABLE
            },
            fieldDefs: [
                { resetFilter: jest.fn() },
                { resetFilter: jest.fn() },
            ],
            setDataGridOption: jest.fn(),
            gridOptions: {
                searchHandler: jest.fn(),
            },
            nodatamessage: 'No data available',
        } as unknown as TableComponent;

        directive = new TableFilterSortDirective(tableComponent);
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should initialize methods correctly', () => {
        expect(directive.searchSortHandler).toEqual(expect.any(Function));
        expect(directive.getSearchResult).toEqual(expect.any(Function));
    });

    describe('getFilterFields', () => {
        it('should return filter fields when searchObj is provided', () => {
            const searchObj = { field: 'name', value: 'John' };
            const filterFields = directive.getFilterFields(searchObj);
            expect(filterFields).toEqual({
                name: {
                    value: 'John',
                    logicalOp: 'AND',
                },
            });
        });

        it('should return filter fields for multiple search objects', () => {
            const searchObj = [{ field: 'name', value: 'John' }, { field: 'age', value: 30 }];
            const filterFields = directive.getFilterFields(searchObj);
            expect(filterFields).toEqual({
                name: {
                    value: 'John',
                    logicalOp: 'AND',
                },
                age: {
                    value: 30,
                    logicalOp: 'AND',
                },
            });
        });
    });

    describe('getNavigationTargetBySortInfo', () => {
        it('should return "first" if sort direction is "desc" and primaryKey contains the sort field', () => {
            (directive as any).table.sortInfo = { direction: 'desc', field: 'someField' };
            (directive as any).table.primaryKey = ['someField'];
            expect(directive.getNavigationTargetBySortInfo()).toBe('first');
        });

        it('should return "last" if sort direction is not "desc"', () => {
            (directive as any).table.sortInfo = { direction: 'asc', field: 'someField' };
            (directive as any).table.primaryKey = ['someField'];
            expect(directive.getNavigationTargetBySortInfo()).toBe('last');
        });

        it('should return "last" if primaryKey does not contain the sort field', () => {
            (directive as any).table.sortInfo = { direction: 'desc', field: 'anotherField' };
            (directive as any).table.primaryKey = ['someField'];
            expect(directive.getNavigationTargetBySortInfo()).toBe('last');
        });
    });

    describe('getTableVisibleCols', () => {
        it('should return columns where showinfilter is true and column is searchable', () => {
            (directive as any).table.columns = {
                col1: { showinfilter: 'true', searchable: true },
                col2: { showinfilter: 'false', searchable: true },
                col3: { showinfilter: 'true', searchable: false },
                rowOperations: { showinfilter: 'true', searchable: true },
            };
            expect(directive.getTableVisibleCols()).toEqual(['col1']);
        });
    });

    describe('getLogicalOperator', () => {
        it('should return the logical operator from filterFields', () => {
            const filterFields = {
                field1: { logicalOp: 'AND' },
                field2: { logicalOp: 'OR' },
            };
            expect(directive.getLogicalOperator(filterFields)).toBe('AND');
        });

        it('should return an empty string if no logicalOp is present', () => {
            const filterFields = {
                field1: {},
            };
            expect(directive.getLogicalOperator(filterFields)).toBe('');
        });
    });

    describe('resetSortStatus', () => {
        it('should reset sort icons and clear sortInfo if sort strings do not match', () => {
            (directive as any).table.sortInfo = { field: 'fieldName', direction: 'asc' };
            const variableSort = 'fieldName desc';
            directive.resetSortStatus(variableSort);
            expect((directive as any).table.callDataGridMethod).toHaveBeenCalledWith('resetSortIcons');
            expect((directive as any).table.sortInfo).toEqual({});
            expect((directive as any).table.setDataGridOption).toHaveBeenCalledWith('sortInfo', {});
        });
        it('should handle empty sortInfo and datasource', () => {
            (directive as any).table.sortInfo = {};
            (directive as any).table.datasource = null;

            directive.resetSortStatus('fieldName desc');

            expect((directive as any).table.callDataGridMethod).not.toHaveBeenCalled();
            expect((directive as any).table.sortInfo).toEqual({});
            expect((directive as any).table.setDataGridOption).not.toHaveBeenCalled();
        });
    });

    describe('clearFilter', () => {
        it('should reset all filters and call onRowFilterChange if filtermode is multicolumn', () => {
            (directive as any).table.filtermode = 'multicolumn';

            directive.clearFilter(false);

            (directive as any).table.fieldDefs.forEach(col => {
                expect(col.resetFilter).toHaveBeenCalled();
            });
        });

        it('should clear search input fields and trigger search button click if filtermode is search', () => {
            (directive as any).table.filtermode = 'search';
            const findMock = (directive as any).table.datagridElement.find as jest.Mock;

            directive.clearFilter(false);

            expect(findMock).toHaveBeenCalledWith('[data-element="dgSearchText"]');
            expect(findMock).toHaveBeenCalledWith('[data-element="dgFilterValue"]');
            expect(findMock().trigger).toHaveBeenCalledWith('click');
        });

        it('should not trigger search button click if skipFilter is true', () => {
            (directive as any).table.filtermode = 'search';
            const findMock = (directive as any).table.datagridElement.find as jest.Mock;

            directive.clearFilter(true);

            expect(findMock).toHaveBeenCalledWith('[data-element="dgSearchText"]');
            expect(findMock).toHaveBeenCalledWith('[data-element="dgFilterValue"]');
            expect(findMock().trigger).not.toHaveBeenCalled();
        });
    });

    describe('getLogicalOperator', () => {
        it('should return the logical operator from filterFields', () => {
            const filterFields = {
                field1: { logicalOp: 'AND' },
                field2: { logicalOp: 'OR' },
            };
            expect(directive.getLogicalOperator(filterFields)).toBe('AND');
        });

        it('should return an empty string if no logicalOp is present', () => {
            const filterFields = {
                field1: {},
            };
            expect(directive.getLogicalOperator(filterFields)).toBe('');
        });
    });

    describe('getSearchResult', () => {
        it('should return data unchanged if no searchObj is provided', () => {
            const data = [{ id: 1, name: 'Test' }];
            expect(directive.getSearchResult(data, null)).toEqual(data);
        });

        it('should sort data based on sortObj', () => {
            const data = [{ id: 2 }, { id: 1 }];
            const sortObj = { field: 'id', direction: 'asc' };
            expect(directive.getSortResult(data, sortObj)).toEqual([{ id: 1 }, { id: 2 }]);
        });

        it('should return data unchanged if no sortObj is provided', () => {
            const data = [{ id: 1 }, { id: 2 }];
            expect(directive.getSortResult(data, {})).toEqual(data);
        });

        it('should handle array of searchObj and apply filters sequentially', () => {
            const data = [{ id: 1, name: 'Test' }, { id: 2, name: 'Test2' }];
            const searchObj = [{ id: 1 }, { name: 'Test' }];
            const visibleCols = ['id', 'name'];
            directive.getTableVisibleCols = jest.fn().mockReturnValue(visibleCols);
            const getFilteredData = jest.fn().mockReturnValue(data);

            expect(directive.getSearchResult(data, searchObj)).toEqual(data);
        });
    });

    describe('getSortResult', () => {
        it('should sort data based on sortObj', () => {
            const data = [{ id: 2 }, { id: 1 }];
            const sortObj = { field: 'id', direction: 'asc' };

            expect(directive.getSortResult(data, sortObj)).toEqual([{ id: 1 }, { id: 2 }]);
        });

        it('should return data unchanged if no sortObj is provided', () => {
            const data = [{ id: 1 }, { id: 2 }];

            expect(directive.getSortResult(data, {})).toEqual(data);
        });
    });

    describe('handleClientSideSortSearch', () => {
        it('should set _isClientSearch to true', () => {
            directive['handleClientSideSortSearch']({}, null, 'search');
            expect((directive as any).table._isClientSearch).toBe(true);
        });

        it('should clone data from __fullData if navigation is enabled', () => {
            ((directive as any).table.isNavigationEnabled as jest.Mock).mockReturnValue(true);
            (getClonedObject as jest.Mock).mockReturnValue([{}]);

            directive['handleClientSideSortSearch']({}, null, 'search');
            expect(getClonedObject).toHaveBeenCalledWith((directive as any).table.__fullData);
        });

        it('should clone data from dataset if navigation is not enabled', () => {
            ((directive as any).table.isNavigationEnabled as jest.Mock).mockReturnValue(false);
            (getClonedObject as jest.Mock).mockReturnValue([{}]);

            directive['handleClientSideSortSearch']({}, null, 'search');
            expect(getClonedObject).toHaveBeenCalledWith((directive as any).table.dataset);
        });

        it('should reset page number and set paging values if navigation is enabled', () => {
            ((directive as any).table.isNavigationEnabled as jest.Mock).mockReturnValue(true);

            directive['handleClientSideSortSearch']({}, null, 'search');
            expect((directive as any).table.dataNavigator.dn.currentPage).toBe(1);
            expect((directive as any).table.dataNavigator.setPagingValues).toHaveBeenCalledWith((directive as any).table.serverData);
        });

        it('should set grid data if navigation is not enabled', () => {
            ((directive as any).table.isNavigationEnabled as jest.Mock).mockReturnValue(false);

            directive['handleClientSideSortSearch']({}, null, 'search');
            expect((directive as any).table.setGridData).toHaveBeenCalledWith((directive as any).table.serverData);
        });
    });

    describe('onRowFilterChange', () => {
        it('should call setStatus and clear selection if no data exists', () => {
            const searchObj = { filter: 'NonExistent' };
            const filteredData: any[] = [];
            jest.spyOn(directive, 'getSearchResult').mockReturnValue(filteredData);
            directive['handleSinglePageSearch'](searchObj);
            expect(tableComponent.callDataGridMethod).toHaveBeenCalledWith('setStatus', 'nodata', tableComponent.nodatamessage);
            expect(tableComponent.selecteditem).toBeUndefined();
        });

        it('should update select all checkbox state', () => {
            const searchObj = { filter: 'Test' };
            const filteredData = [{ id: 1, name: 'Test' }];
            jest.spyOn(directive, 'getSearchResult').mockReturnValue(filteredData);
            directive['handleSinglePageSearch'](searchObj);
            expect(tableComponent.callDataGridMethod).toHaveBeenCalledWith('updateSelectAllCheckboxState');
        });
    });

    describe('handleServerSideSearch', () => {
        it('should show error message if refreshDataSource fails', async () => {
            (refreshDataSource as jest.Mock).mockRejectedValue({});
            const toggleMessageSpy = jest.spyOn((directive as any).table, 'toggleMessage');

            await directive['handleServerSideSearch']({});

            expect(toggleMessageSpy).toHaveBeenCalledWith(true, 'error', (directive as any).table.nodatamessage);
        });
    });
});
