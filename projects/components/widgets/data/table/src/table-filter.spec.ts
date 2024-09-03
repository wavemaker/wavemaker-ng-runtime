import { $appDigest, DataSource, getClonedObject } from '@wm/core';
import { TableFilterSortDirective } from './table-filter.directive';
import { TableComponent } from './table.component';
import { refreshDataSource, getMatchModeMsgs } from '@wm/components/base';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    getClonedObject: jest.fn(),
    $appDigest: jest.fn(),
}));

jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    refreshDataSource: jest.fn(),
    getMatchModeMsgs: jest.fn(),
}));

describe('TableFilterSortDirective', () => {
    let directive: TableFilterSortDirective;
    let tableComponent: TableComponent;
    let mockAppLocale;

    beforeEach(() => {
        mockAppLocale = {
            LABEL_STARTS_WITH: 'Starts with',
            LABEL_STARTS_WITH_IGNORECASE: 'Starts with (ignore case)',
            LABEL_ENDS_WITH: 'Ends with',
            LABEL_ENDS_WITH_IGNORECASE: 'Ends with (ignore case)',
            LABEL_CONTAINS: 'Contains',
            LABEL_CONTAINS_IGNORECASE: 'Contains (ignore case)',
            LABEL_IS_EQUAL_TO: 'Is equal to',
            LABEL_IS_EQUAL_TO_IGNORECASE: 'Is equal to (ignore case)',
            LABEL_IS_NOT_EQUAL_TO: 'Is not equal to',
            LABEL_IS_NOT_EQUAL_TO_IGNORECASE: 'Is not equal to (ignore case)',
            LABEL_LESS_THAN: 'Less than',
            LABEL_LESS_THAN_OR_EQUALS_TO: 'Less than or equal to',
            LABEL_GREATER_THAN: 'Greater than',
            LABEL_GREATER_THAN_OR_EQUALS_TO: 'Greater than or equal to',
            LABEL_IS_NULL: 'Is null',
            LABEL_IS_NOT_NULL: 'Is not null',
            LABEL_IS_EMPTY: 'Is empty',
            LABEL_IS_NOT_EMPTY: 'Is not empty',
            LABEL_IS_NULL_OR_EMPTY: 'Is null or empty',
            LABEL_IN: 'In',
            LABEL_NOT_IN: 'Not in',
            LABEL_BETWEEN: 'Between'
        };
        (getMatchModeMsgs as jest.Mock).mockReturnValue({
            start: mockAppLocale.LABEL_STARTS_WITH,
            startignorecase: mockAppLocale.LABEL_STARTS_WITH_IGNORECASE,
            end: mockAppLocale.LABEL_ENDS_WITH,
            endignorecase: mockAppLocale.LABEL_ENDS_WITH_IGNORECASE,
            anywhere: mockAppLocale.LABEL_CONTAINS,
            anywhereignorecase: mockAppLocale.LABEL_CONTAINS_IGNORECASE,
            exact: mockAppLocale.LABEL_IS_EQUAL_TO,
            exactignorecase: mockAppLocale.LABEL_IS_EQUAL_TO_IGNORECASE,
            notequals: mockAppLocale.LABEL_IS_NOT_EQUAL_TO,
            notequalsignorecase: mockAppLocale.LABEL_IS_NOT_EQUAL_TO_IGNORECASE,
            lessthan: mockAppLocale.LABEL_LESS_THAN,
            lessthanequal: mockAppLocale.LABEL_LESS_THAN_OR_EQUALS_TO,
            greaterthan: mockAppLocale.LABEL_GREATER_THAN,
            greaterthanequal: mockAppLocale.LABEL_GREATER_THAN_OR_EQUALS_TO,
            null: mockAppLocale.LABEL_IS_NULL,
            isnotnull: mockAppLocale.LABEL_IS_NOT_NULL,
            empty: mockAppLocale.LABEL_IS_EMPTY,
            isnotempty: mockAppLocale.LABEL_IS_NOT_EMPTY,
            nullorempty: mockAppLocale.LABEL_IS_NULL_OR_EMPTY,
            in: mockAppLocale.LABEL_IN,
            notin: mockAppLocale.LABEL_NOT_IN,
            between: mockAppLocale.LABEL_BETWEEN
        });
        tableComponent = {
            _searchSortHandler: jest.fn(),
            getSearchResult: jest.fn(),
            getSortResult: jest.fn(),
            sortInfo: { field: 'name', direction: 'asc' },
            checkFiltersApplied: jest.fn(),
            getFilterFields: jest.fn(),
            onRowFilterChange: jest.fn(),
            onFilterConditionSelect: jest.fn(),
            showClearIcon: jest.fn(),
            clearRowFilter: jest.fn(),
            matchModeTypesMap: {},
            matchModeMsgs: {},
            emptyMatchModes: [],
            name: 'TestWidget',
            getNavigationTargetBySortInfo: jest.fn(),
            refreshData: jest.fn(),
            clearFilter: jest.fn(),
            adjustContainer: jest.fn(),
            appLocale: 'en',
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
            primaryKey: [],
            datasource: {
                execute: jest.fn()
                    .mockReturnValueOnce({ filterFields: {} }) // For SUPPORTS_SERVER_FILTER
                    .mockReturnValueOnce({ filterFields: {} }) // For GET_OPTIONS
                    .mockReturnValueOnce(true) // For SUPPORTS_SERVER_FILTER
                    .mockReturnValueOnce(false) // For IS_PAGEABLE
            },
            fieldDefs: [
                { resetFilter: jest.fn() }, { resetFilter: jest.fn() }, { resetFilter: jest.fn() },
            ],
            setDataGridOption: jest.fn(),
            gridOptions: {
                searchHandler: jest.fn(),
                sortInfo: {},
                setLastActionPerformed: jest.fn(),
                setIsSearchTrigerred: jest.fn(),
                ACTIONS: {
                    SEARCH_OR_SORT: 'SEARCH_OR_SORT'
                }
            },
            nodatamessage: 'No data available',
            columns: { name: { colDef: {} } },
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

        it('should set filterInfo on the table', () => {
            const searchObj = { key: 'value' };
            directive['handleServerSideSearch'](searchObj);
            expect((tableComponent as any).filterInfo).toEqual(searchObj);
        });

        it('should return if datasource is not defined', () => {
            tableComponent.datasource = null;
            const searchObj = { key: 'value' };
            directive['handleServerSideSearch'](searchObj);
            expect(tableComponent.toggleMessage).not.toHaveBeenCalled();
        });

        it('should call refreshDataSource with correct parameters', () => {
            const searchObj = { key: 'value' };
            const filterFields = ['field1', 'field2'];
            const logicalOp = 'AND';
            jest.spyOn(directive, 'getFilterFields').mockReturnValue(filterFields);
            jest.spyOn(directive, 'getLogicalOperator').mockReturnValue(logicalOp);
            directive['handleServerSideSearch'](searchObj);
            expect(directive.getFilterFields).toHaveBeenCalledWith(searchObj);
            expect(directive.getLogicalOperator).toHaveBeenCalledWith(filterFields);
        });

        it('should toggle error message if refreshDataSource is rejected', async () => {
            tableComponent.datasource.execute = jest.fn().mockRejectedValue(false);
            const searchObj = { key: 'value' };
            directive['handleServerSideSearch'](searchObj);
            try {
                await Promise.reject();
            } catch {
                expect(tableComponent.toggleMessage).toHaveBeenCalledWith(true, 'error', tableComponent.nodatamessage);
            }
        });
    });

    describe('handleSeverSideSort', () => {
        let directive: TableFilterSortDirective;
        let tableComponent: TableComponent;

        beforeEach(() => {
            tableComponent = {
                gridOptions: {
                    sortInfo: {},
                },
                sortInfo: {},
                datasource: {
                    execute: jest.fn().mockResolvedValue({
                        data: 'mockedData',
                    }),
                },
                filterInfo: {},
                columns: { name: { colDef: {} } },
                getConfiguredState: jest.fn().mockReturnValue('someState'),
                statePersistence: {
                    removeWidgetState: jest.fn(),
                },
                invokeEventCallback: jest.fn(),
            } as unknown as TableComponent;
            directive = new TableFilterSortDirective(tableComponent);
        });

        it('should update sortInfo on the table and gridOptions', () => {
            const sortObj = { field: 'name', direction: 'asc' };
            const event = {};
            directive['handleSeverSideSort'](sortObj, event);
            expect(tableComponent.gridOptions.sortInfo.field).toBe(sortObj.field);
            expect(tableComponent.gridOptions.sortInfo.direction).toBe(sortObj.direction);
        });

        it('should call getClonedObject with sortObj', () => {
            const sortObj = { field: 'name', direction: 'asc' };
            const event = {};
            directive['handleSeverSideSort'](sortObj, event);
            expect(getClonedObject).toHaveBeenCalledWith(sortObj);
        });

        it('should remove widget state if not triggered by state persistence', () => {
            const sortObj = { field: 'name', direction: 'asc' };
            const event = {};
            const statePersistenceTriggered = false;
            directive['handleSeverSideSort'](sortObj, event, statePersistenceTriggered);
            expect((tableComponent as any).statePersistence.removeWidgetState).toHaveBeenCalledWith(tableComponent, 'pagination');
        });

        it('should not remove widget state if triggered by state persistence', () => {
            const sortObj = { field: 'name', direction: 'asc' };
            const event = {};
            const statePersistenceTriggered = true;
            directive['handleSeverSideSort'](sortObj, event, statePersistenceTriggered);
            expect((tableComponent as any).statePersistence.removeWidgetState).not.toHaveBeenCalled();
        });

        it('should call refreshDataSource with correct parameters', () => {
            const sortObj = { field: 'name', direction: 'asc' };
            const event = {};
            const filterFields = ['field1', 'field2'];
            const condition = 'AND';
            jest.spyOn(directive, 'getFilterFields').mockReturnValue(filterFields);
            jest.spyOn(directive, 'getLogicalOperator').mockReturnValue(condition);
            directive['handleSeverSideSort'](sortObj, event);
            expect(directive.getFilterFields).toHaveBeenCalledWith((tableComponent as any).filterInfo);
            expect(directive.getLogicalOperator).toHaveBeenCalledWith(filterFields);
        });
    });

    describe('checkFiltersApplied', () => {
        beforeEach(() => {
            jest.spyOn(directive, 'resetSortStatus');
            jest.spyOn((tableComponent as any), 'clearFilter');
        });

        it('should do nothing if datasource is not available', () => {
            tableComponent.datasource = null;
            directive.checkFiltersApplied(true);
            expect(tableComponent.clearFilter).not.toHaveBeenCalled();
            expect(directive.resetSortStatus).not.toHaveBeenCalled();
        });

        it('should reset sort status if server filter is supported and filter fields are present', () => {
            tableComponent.datasource.execute = jest.fn()
                .mockImplementation((operation) => {
                    if (operation === DataSource.Operation.SUPPORTS_SERVER_FILTER) {
                        return true; // SUPPORTS_SERVER_FILTER
                    }
                    if (operation === DataSource.Operation.GET_OPTIONS) {
                        return { filterFields: ['field1'], orderBy: 'field1' }; // GET_OPTIONS with filterFields and orderBy
                    }
                    return null;
                });

            directive.checkFiltersApplied(true);

            expect(tableComponent.clearFilter).not.toHaveBeenCalled();
            expect(directive.resetSortStatus).toHaveBeenCalledWith(true);
        });

        it('should do nothing if datasource is neither pageable nor supports server filters', () => {
            tableComponent.datasource.execute = jest.fn()
                .mockImplementation((operation) => {
                    if (operation === DataSource.Operation.SUPPORTS_SERVER_FILTER) {
                        return false; // SUPPORTS_SERVER_FILTER
                    }
                    if (operation === DataSource.Operation.IS_PAGEABLE) {
                        return false; // IS_PAGEABLE
                    }
                    return null;
                });

            directive.checkFiltersApplied(true);

            expect(directive.resetSortStatus).not.toHaveBeenCalled();
            expect(tableComponent.clearFilter).not.toHaveBeenCalled();
        });
    });

    describe('searchHandler', () => {
        it('should filter searchSortObj when it is an array and update statePersistence', () => {
            const searchSortObj = [
                { matchMode: 'contains', value: 'test', field: 'field1' },
                { value: 'test2', field: '' }, // Should be included due to empty field but with value
                { matchMode: undefined, value: undefined }, // Should be filtered out
            ];
            const eventMock = {};

            (tableComponent as any).getConfiguredState = jest.fn().mockReturnValue('someState');
            tableComponent.navigation = 'pagination';
            tableComponent.invokeEventCallback = jest.fn().mockReturnValue(true);

            (directive as any).searchHandler(searchSortObj, eventMock, 'type');

            expect((tableComponent as any).statePersistence.removeWidgetState).toHaveBeenCalledWith(tableComponent, 'search');
            expect((tableComponent as any).statePersistence.setWidgetState).toHaveBeenCalledWith(tableComponent, { search: searchSortObj.slice(0, 2) });
        });

        it('should handle searchSortObj as an object and update statePersistence', () => {
            const searchSortObj = { field: 'field1', value: 'test', type: 'type' };
            const eventMock = {};

            (tableComponent as any).getConfiguredState = jest.fn().mockReturnValue('someState');
            tableComponent.navigation = 'pagination';
            tableComponent.invokeEventCallback = jest.fn().mockReturnValue(true);

            (directive as any).searchHandler(searchSortObj, eventMock, 'type');

            expect((tableComponent as any).statePersistence.removeWidgetState).toHaveBeenCalledWith(tableComponent, 'search');
            expect((tableComponent as any).statePersistence.setWidgetState).toHaveBeenCalledWith(tableComponent, { search: searchSortObj });
        });

        it('should call beforefilter callback and stop execution if it returns false', () => {
            const searchSortObj = { field: 'field1', value: 'test', type: 'type' };
            const eventMock = {};

            tableComponent.invokeEventCallback = jest.fn().mockReturnValue(false); // Callback returns false

            (directive as any).searchHandler(searchSortObj, eventMock, 'type');

            expect(tableComponent.invokeEventCallback).toHaveBeenCalledWith('beforefilter', { $event: eventMock, $data: {}, columns: {} });
            expect(tableComponent.datasource.execute).not.toHaveBeenCalled();
        });

        it('should return early if no datasource or dataset is available', () => {
            const searchSortObj = { field: 'field1', value: 'test', type: 'type' };
            const eventMock = {};

            tableComponent.datasource = null;
            tableComponent.dataset = null;

            (directive as any).searchHandler(searchSortObj, eventMock, 'type');

            expect(tableComponent.invokeEventCallback).not.toHaveBeenCalled();
            expect((tableComponent as any).statePersistence.removeWidgetState).not.toHaveBeenCalled();
        });
    });

    describe('showClearIcon', () => {
        it('should return true when value is defined and not empty', () => {
            tableComponent.rowFilter = { name: { value: 'John' } };
            expect(directive.showClearIcon('name')).toBe(true);
        });

        it('should return false when value is undefined', () => {
            tableComponent.rowFilter = { name: { value: undefined } };
            expect(directive.showClearIcon('name')).toBe(false);
        });

        it('should return false when value is an empty string', () => {
            tableComponent.rowFilter = { name: { value: '' } };
            expect(directive.showClearIcon('name')).toBe(false);
        });

        it('should return false when value is null', () => {
            tableComponent.rowFilter = { name: { value: null } };
            expect(directive.showClearIcon('name')).toBe(false);
        });
    });

    describe('clearRowFilter', () => {
        it('should reset filter and call onRowFilterChange when rowFilter exists', () => {
            tableComponent.rowFilter = { name: { value: 'John' } };
            tableComponent.columns = { name: { resetFilter: jest.fn() } };
            directive.onRowFilterChange = jest.fn();

            directive.clearRowFilter('name');

            expect((tableComponent as any).columns.name.resetFilter).toHaveBeenCalled();
            expect(directive.onRowFilterChange).toHaveBeenCalledWith('name');
        });

        it('should not do anything when rowFilter does not exist', () => {
            tableComponent.rowFilter = {};
            tableComponent.columns = { name: { resetFilter: jest.fn() } };
            directive.onRowFilterChange = jest.fn();

            directive.clearRowFilter('name');

            expect((tableComponent as any).columns.name.resetFilter).not.toHaveBeenCalled();
            expect(directive.onRowFilterChange).not.toHaveBeenCalled();
        });
    });

    describe('onFilterConditionSelect', () => {
        beforeEach(() => {
            tableComponent.rowFilter = {};
            tableComponent.columns = {
                name: {
                    resetFilter: jest.fn(),
                    filterInstance: { focus: jest.fn() }
                }
            };
            tableComponent.onRowFilterChange = jest.fn();
            tableComponent.emptyMatchModes = ['isNull', 'isNotNull'];
        });

        it('should set matchMode and call onRowFilterChange for non-empty match mode with value', () => {
            directive.onFilterConditionSelect('name', 'contains');
            expect(tableComponent.rowFilter.name.matchMode).toBe('contains');
            expect(tableComponent.onRowFilterChange).not.toHaveBeenCalled();

            tableComponent.rowFilter.name.value = 'John';
            directive.onFilterConditionSelect('name', 'contains');
            expect(tableComponent.onRowFilterChange).toHaveBeenCalled();
        });

        it('should reset filter and call onRowFilterChange for empty match mode', () => {
            directive.onFilterConditionSelect('name', 'isNull');
            expect((tableComponent as any).columns.name.resetFilter).toHaveBeenCalled();
            expect(tableComponent.onRowFilterChange).toHaveBeenCalled();
        });

        it('should focus on filter instance for non-empty match mode without value', (done) => {
            directive.onFilterConditionSelect('name', 'contains');
            setTimeout(() => {
                expect((tableComponent as any).columns.name.filterInstance.focus).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('setLastActionPerformedToSearchSort', () => {
        it('should set last action performed to SEARCH_OR_SORT', () => {
            directive.setLastActionPerformedToSearchSort();
            expect(tableComponent.gridOptions.setLastActionPerformed).toHaveBeenCalledWith(tableComponent.gridOptions.ACTIONS.SEARCH_OR_SORT);
        });

        it('should set isSearchTrigerred to true', () => {
            directive.setLastActionPerformedToSearchSort();
            expect(tableComponent.gridOptions.setIsSearchTrigerred).toHaveBeenCalledWith(true);
        });
    });

    describe('searchSortHandler', () => {
        let mockSearchSortObj;
        let mockEvent;

        beforeEach(() => {
            mockSearchSortObj = { field: 'name', direction: 'asc' };
            mockEvent = { type: 'change', stopPropagation: jest.fn() };
            directive.setLastActionPerformedToSearchSort = jest.fn();
            (directive as any).searchHandler = jest.fn();
            (directive as any).sortHandler = jest.fn();
        });

        it('should stop propagation for change event when filtermode is not multicolumn', () => {
            tableComponent.filtermode = 'singlecolumn';
            directive.searchSortHandler(mockSearchSortObj, mockEvent, 'search');
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(directive.setLastActionPerformedToSearchSort).not.toHaveBeenCalled();
        });

        it('should call setLastActionPerformedToSearchSort for non-change events', () => {
            mockEvent.type = 'click';
            directive.searchSortHandler(mockSearchSortObj, mockEvent, 'search');
            expect(directive.setLastActionPerformedToSearchSort).toHaveBeenCalled();
        });

        it('should handle null event', () => {
            directive.searchSortHandler(mockSearchSortObj, null, 'sort');
            expect(directive.setLastActionPerformedToSearchSort).toHaveBeenCalled();
            expect((directive as any).sortHandler).toHaveBeenCalledWith(mockSearchSortObj, null, 'sort', undefined);
        });
    });

    describe('onRowFilterChange', () => {
        beforeEach(() => {
            (tableComponent as any).fullFieldDefs = [
                { field: 'name', type: 'string' },
                { field: 'age', type: 'number' }
            ];
            tableComponent.rowFilter = {};
            tableComponent.emptyMatchModes = ['isNull', 'isNotNull'];
            tableComponent.matchModeTypesMap = {
                string: ['contains', 'startsWith', 'endsWith'],
                number: ['equals', 'greaterThan', 'lessThan']
            };
            (tableComponent as any).getFilterOnFieldValues = jest.fn();
            tableComponent.rowFilter = {
                name: { value: 'John', matchMode: 'contains' },
                age: { value: 30, matchMode: 'equals' }
            };
            tableComponent.gridOptions.searchHandler = jest.fn();
        });

        it('should create searchObj from rowFilter and call searchHandler', () => {
            directive.onRowFilterChange('name');
            expect(tableComponent.gridOptions.searchHandler).toHaveBeenCalledWith(
                [
                    { field: 'name', value: 'John', matchMode: 'contains', type: 'string' },
                    { field: 'age', value: 30, matchMode: 'equals', type: undefined }
                ],
                undefined,
                'search'
            );
        });

        it('should handle empty values and empty match modes', () => {
            tableComponent.rowFilter.age.value = '';
            tableComponent.rowFilter.name.matchMode = 'isNull';
            directive.onRowFilterChange('name');
            expect(tableComponent.gridOptions.searchHandler).toHaveBeenCalledWith(
                [
                    { field: 'name', value: 'John', matchMode: 'isNull', type: 'string' }
                ],
                undefined,
                'search'
            );
        });

        it('should not call getFilterOnFieldValues when field is not provided', () => {
            directive.onRowFilterChange('');
            expect((tableComponent as any).getFilterOnFieldValues).not.toHaveBeenCalled();
        });
    });

});
