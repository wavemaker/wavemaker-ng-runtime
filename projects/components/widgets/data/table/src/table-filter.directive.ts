import { Directive, Inject, Self } from '@angular/core';

import { $appDigest, DataSource, DataType, FormWidgetType, getClonedObject, isDefined, isNumberType, adjustContainerRightEdges } from '@wm/core';
import { getMatchModeMsgs, getMatchModeTypesMap, isDataSetWidget, refreshDataSource, unsupportedStatePersistenceTypes } from '@wm/components/base';

import { TableComponent } from './table.component';
import {
    endsWith,
    filter,
    find,
    forEach,
    get, head,
    includes, isArray, isEmpty,
    isEqual, isNull, isObject, orderBy, range, split,
    startsWith, toLower,
    toNumber,
    toString
} from "lodash-es";

declare const $;
declare const moment;

const emptyMatchModes = ['null', 'empty', 'nullorempty', 'isnotnull', 'isnotempty'];

// Get search value based on the time
const getSearchValue = (value, type) => {
    if (!isDefined(value) || value === '') {
        return undefined;
    }
    if (isNumberType(type)) {
        return toNumber(value);
    }
    if (type === DataType.DATETIME) {
        return moment(value).valueOf();
    }
    return toString(value).toLowerCase();
};

// Filter the data based on the search value and conditions
const getFilteredData = (data, searchObj, visibleCols = []) => {
    const searchVal = getSearchValue(searchObj.value, searchObj.type);
    let currentVal;
    // Return whole data if
    // - search value is undefined and matchmode is not an empty matchmode type
    // - search value is null and datatype is number. Null can not be compared with numeric values[WMS-19275].
    if ((!isDefined(searchVal) && !includes(emptyMatchModes, searchObj.matchMode)) || (isNumberType(searchObj.type) && isNull(searchObj.value))) {
        return data;
    }
    data = data.filter((obj) => {
        let isExists;
        if (searchObj.field) {
            currentVal = getSearchValue(get(obj, searchObj.field), searchObj.type);
        } else {
            currentVal = [];
            forEach(obj, (val, key) => {
                if ((includes(visibleCols, key))) {
                    currentVal.push(val);
                } else {
                    // WMS-22271 If the key is in nested key format (dot format)
                    // Find all the indexes of the key in visiblecols and extract their values from obj
                    const colIndex = filter(range(visibleCols.length), (i) => visibleCols[i].includes(key));
                    forEach(colIndex, (index) => {
                        // @ts-ignore
                        const value = get(obj, visibleCols[index]);
                        if (currentVal.indexOf(value) < 0) {
                            currentVal.push(value);
                        }
                    });
                }
            });
            currentVal = currentVal.join(' ').toLowerCase(); // If field is not there, search on all the columns
        }
        switch (searchObj.matchMode) {
            case 'start':
                isExists = startsWith(currentVal, searchVal as string);
                break;
            case 'end':
                isExists = endsWith(currentVal, searchVal as string);
                break;
            case 'exact':
                isExists = isEqual(currentVal, searchVal);
                break;
            case 'notequals':
                isExists = !isEqual(currentVal, searchVal);
                break;
            case 'null':
                isExists = isNull(currentVal);
                break;
            case 'isnotnull':
                isExists = !isNull(currentVal);
                break;
            case 'empty':
                isExists = isEmpty(currentVal);
                break;
            case 'isnotempty':
                isExists = !isEmpty(currentVal);
                break;
            case 'nullorempty':
                isExists = isNull(currentVal) || isEmpty(currentVal);
                break;
            case 'lessthan':
                isExists = currentVal < searchVal;
                break;
            case 'lessthanequal':
                isExists = currentVal <= searchVal;
                break;
            case 'greaterthan':
                isExists = currentVal > searchVal;
                break;
            case 'greaterthanequal':
                isExists = currentVal >= searchVal;
                break;
            default:
                isExists = isNumberType(searchObj.type) ? isEqual(currentVal, searchVal) : includes(currentVal, searchVal);
                break;
        }
        return isExists;
    });
    return data;
};

// Set the filter fields when the search value is specified and field is not selected
const setAllFilterFields = function(filterFields, searchObj, visibleCols) {
    visibleCols.forEach(function(field) {
        filterFields[field] = {
            'value': searchObj.value,
            'type' : searchObj.value.type,
            'logicalOp': 'OR'
        };
        if (searchObj.matchMode) {
            filterFields[field].matchMode = searchObj.matchMode;
        }
    });
};

// Set the filter fields as required by datasource
const setFilterFields = (filterFields, searchObj, visibleCols = []) => {
    const field = searchObj && searchObj.field;
    /*Set the filter options when a field/column has been selected.*/
    if (field) {
        filterFields[field] = {
            'value'     : searchObj.value,
            'logicalOp' : 'AND'
        };
        if (searchObj.matchMode) {
            filterFields[field].matchMode = searchObj.matchMode;
        }
    } else {
        /*Set the filter options when a field/column hasn't been selected.*/
        setAllFilterFields(filterFields, searchObj, visibleCols);
    }
};

// Transform filter fields from array to object having field names as keys
const transformFilterField = (userFilters, filterField) => {
    if (filterField.field) {
        userFilters[filterField.field] = {
            value: filterField.value,
            matchMode: filterField.matchMode,
            type: filterField.type
        };
    }
};

// Build a filter Fields object
const addToFilterFields = (filterFields, searchObj) => {
    filterFields.push({
        field: (searchObj.key) ? searchObj.key : '',
        matchMode: searchObj.matchMode,
        type: searchObj.type,
        value: searchObj.value
    });
};

@Directive({
    selector: '[wmTableFilterSort]',
    standalone: false
})
export class TableFilterSortDirective {

    constructor(@Self() @Inject(TableComponent) private table) {
        table._searchSortHandler = this.searchSortHandler.bind(this);
        table.getSearchResult = this.getSearchResult.bind(this);
        table.getSortResult = this.getSortResult.bind(this);
        table.checkFiltersApplied = this.checkFiltersApplied.bind(this);
        table.getFilterFields = this.getFilterFields.bind(this);
        table.onRowFilterChange = this.onRowFilterChange.bind(this);
        table.onFilterConditionSelect = this.onFilterConditionSelect.bind(this);
        table.showClearIcon = this.showClearIcon.bind(this);
        table.clearRowFilter = this.clearRowFilter.bind(this);
        table.matchModeTypesMap = getMatchModeTypesMap();
        table.matchModeMsgs = getMatchModeMsgs(table.appLocale);
        table.emptyMatchModes = emptyMatchModes;
        table.getNavigationTargetBySortInfo = this.getNavigationTargetBySortInfo.bind(this);
        table.refreshData = this.refreshData.bind(this);
        table.clearFilter = this.clearFilter.bind(this);
        table.adjustContainer = this.adjustContainer.bind(this);
    }

    adjustContainer(fieldName) {
        setTimeout(() => {
            adjustContainerRightEdges($('bs-dropdown-container'), this.table.rowFilterCompliedTl[fieldName], this.table, $('bs-dropdown-container .dropdown-menu'));
        });
    }

    // Get first or last page based on sort info of primary key
    getNavigationTargetBySortInfo() {
        return this.table.sortInfo && this.table.sortInfo.direction === 'desc' &&
        includes(this.table.primaryKey, this.table.sortInfo.field) ? 'first' : 'last';
    }

    // Returns all the columns of the table wherein, showinfilter is set to true
    getTableVisibleCols() {
        const visibleCols = [];
        forEach(this.table.columns, (val, col) => {
            if (toLower(toString(val.showinfilter)) === 'true' && col !== 'rowOperations' && val.searchable) {
                visibleCols.push(col);
            }
        });
        return visibleCols;
    }

    // call the set filter fields function based on the field selected or not
    invokeSetFilterfieldBasedOnFieldval(searchObj, filterFields) {
        if (searchObj.field) {
            setFilterFields(filterFields, searchObj);
        } else if (!isEmpty(searchObj)) {
           const visibleCols = this.getTableVisibleCols();
            setFilterFields(filterFields, searchObj, visibleCols);
        }
    }

    // Get the filter fields as required by datasource
    getFilterFields(searchObj) {
        searchObj = searchObj || {};
        const filterFields = {};
        if (isArray(searchObj)) {
            forEach(searchObj, obj => {
               this.invokeSetFilterfieldBasedOnFieldval(obj, filterFields);
            });
        } else {
            this.invokeSetFilterfieldBasedOnFieldval(searchObj, filterFields);
        }
        return filterFields;
    }

    // Get the logical operator for the search filter
    getLogicalOperator(filterFields) {
        let operator = '';
        for (const field in filterFields) {
            operator = filterFields[field]['logicalOp'] || '';
            break;
        }
        return operator;
    }

    // Reset the sort based on sort returned by the call
    resetSortStatus(variableSort) {
        let gridSortString;
        if (!isEmpty(this.table.sortInfo) && this.table.datasource) {
            gridSortString = this.table.sortInfo.field + ' ' + this.table.sortInfo.direction;
            variableSort = this.table.datasource.execute(DataSource.Operation.GET_OPTIONS).orderBy || variableSort;
            if (variableSort) { // If multiple order by fields are present, compare with the first one
                variableSort = head(split(variableSort, ','));
            }
            if (gridSortString !== variableSort) {
                this.table.callDataGridMethod('resetSortIcons');
                this.table.sortInfo = {};
                this.table.setDataGridOption('sortInfo', {});
            }
        }
    }

    // Clear the all the filters applied
    clearFilter(skipFilter) {
        let $gridElement;
        this.table.filterInfo = {};
        if (this.table.filtermode === 'multicolumn') {
            this.table.fieldDefs.forEach(col => {
                if (col.resetFilter) {
                    col.resetFilter();
                }
            });
            if (!skipFilter) {
                this.table.onRowFilterChange();
            }
        } else if (this.table.filtermode === 'search') {
            $gridElement = this.table.datagridElement;
            $gridElement.find('[data-element="dgSearchText"]').val('');
            $gridElement.find('[data-element="dgFilterValue"]').val('');
            if (!skipFilter) {
                $gridElement.find('.app-search-button').trigger('click');
            }
        }
    }

    // Check the filters applied and remove if dat does not contain any filters
    checkFiltersApplied(variableSort) {
        if (!this.table.datasource) {
            return;
        }
        if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_SERVER_FILTER)) {
            if (isEmpty(this.table.datasource.execute(DataSource.Operation.GET_OPTIONS).filterFields)) {
                this.clearFilter(true);
            }
            this.resetSortStatus(variableSort);
            return;
        }
        if (this.table.datasource.execute(DataSource.Operation.IS_PAGEABLE)) {
            this.resetSortStatus(variableSort);
        }
    }

    // Returns data filtered using searchObj
    getSearchResult(data, searchObj) {
        const visibleCols = this.getTableVisibleCols();
        if (!searchObj) {
            return data;
        }
        if (isArray(searchObj)) {
            searchObj.forEach((obj) => {
                data = getFilteredData(data, obj, visibleCols);
            });
        } else {
            data = getFilteredData(data, searchObj, visibleCols);
        }
        return data;
    }

    // Returns data sorted using sortObj
    getSortResult(data, sortObj) {
        if (sortObj && sortObj.direction) {
            data = orderBy(data, sortObj.field, sortObj.direction);
        }
        return data;
    }

    // This method handles the client side sort and search
    private handleClientSideSortSearch(searchSortObj, e, type) {
        this.table._isClientSearch = true;

        let data;
        data = this.table.isNavigationEnabled() ? getClonedObject(this.table.__fullData) : getClonedObject(this.table.dataset);
        if (type === 'search') {
            this.table.filterInfo = searchSortObj;
        } else {
            this.table.sortInfo = searchSortObj;
        }
        if (isObject(data) && !isArray(data)) {
            data = [data];
        }
        /*Both the functions return same 'data' if arguments are undefined*/
        data = this.getSearchResult(data, this.table.filterInfo);
        data = this.getSortResult(data, this.table.sortInfo);
        this.table.serverData = data;

        if (type === 'sort') {
            // Calling 'onSort' event
            this.table.invokeEventCallback('sort', {$event: e, $data: {
                    data: this.table.serverData,
                    sortDirection: this.table.sortInfo.direction,
                    colDef: this.table.columns[this.table.sortInfo.field]
                }});
        }

        if (this.table.isNavigationEnabled()) {
            // Reset the page number to 1
            this.table.dataNavigator.dn.currentPage = 1;
            this.table.dataNavigator.setPagingValues(data);
        } else {
            this.table.setGridData(this.table.serverData);
        }
    }

    // This method handles the search for pageable datasource
    private handleSinglePageSearch(searchObj) {
        this.table._isPageSearch = true;

        let data  = getClonedObject(this.table.gridData);
        const $rows = this.table.datagridElement.find('tbody tr.app-datagrid-row');
        this.table.filterInfo = searchObj;
        data = this.getSearchResult(data, searchObj);
        // Compared the filtered data and original data, to show or hide the rows
        forEach(this.table.gridData, (value, index) => {
            const $row = $($rows[index]);
            if (find(data, obj => isEqual(obj, value))) {
                $row.show();
            } else {
                $row.hide();
            }
        });
        if (data && data.length) {
            this.table.callDataGridMethod('setStatus', 'ready');
            // Select the first row after the search for single select
            if (this.table.gridfirstrowselect && !this.table.multiselect) {
                this.table.callDataGridMethod('selectFirstRow', true, true);
            }
        } else {
            this.table.callDataGridMethod('setStatus', 'nodata', this.table.nodatamessage);
            this.table.selecteditem = undefined;
        }
        this.table.callDataGridMethod('updateSelectAllCheckboxState');
    }

    // This method handles the search for server side variables
    private handleServerSideSearch(searchObj) {
        this.table.filterInfo = searchObj;

        if (!this.table.datasource) {
            return;
        }

        const sortInfo     = this.table.sortInfo;
        const sortOptions  = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
        const filterFields = this.getFilterFields(searchObj);
        const logicalOp = this.getLogicalOperator(filterFields);
        refreshDataSource(this.table.datasource, {
            page: 1,
            filterFields : filterFields,
            orderBy : sortOptions,
            condition : logicalOp
        }).then(() => {
            $appDigest();
        }, () => {
            this.table.toggleMessage(true, 'error', this.table.nodatamessage);
        });
    }

    // This method handles the sort for server side variables
    private handleSeverSideSort(sortObj, e, statePersistenceTriggered?) {
        // Update the sort info for passing to datagrid
        this.table.gridOptions.sortInfo.field = sortObj.field;
        this.table.gridOptions.sortInfo.direction = sortObj.direction;
        this.table.sortInfo = getClonedObject(sortObj);

        const sortOptions  = sortObj && sortObj.direction ? (sortObj.field + ' ' + sortObj.direction) : '';
        const filterFields = this.getFilterFields(this.table.filterInfo);
        const condition = this.getLogicalOperator(filterFields);
        if (!statePersistenceTriggered && this.table.getConfiguredState() !== 'none') {
            this.table.statePersistence.removeWidgetState(this.table, 'pagination');
        }

        refreshDataSource(this.table.datasource, {
            page : 1,
            filterFields : filterFields,
            orderBy : sortOptions,
            condition : condition
        }).then((response) => {
            $appDigest();
            const data = (response && response.data) ? response.data : response;
            this.table.invokeEventCallback('sort', {$event: e, $data: {
                    data,
                    sortDirection: sortObj.direction,
                    colDef: this.table.columns[sortObj.field]

                    }
            });
        });
    }

    private searchHandler(searchSortObj, e, type, statePersistenceTriggered?) {
        let obj;
        if (isArray(searchSortObj)) {
            obj = searchSortObj.filter(function(searchObject) {
                return (searchObject.matchMode !== undefined && searchObject.value !== undefined) || (searchObject.value !== undefined && searchObject.field === '');
            });
        } else {
            obj = {field: searchSortObj.field, value: searchSortObj.value, type: searchSortObj.type};
        }
        if (this.table.getConfiguredState() !== 'none' && unsupportedStatePersistenceTypes.indexOf(this.table.navigation) < 0) {
            if ((isArray(searchSortObj) && obj.length) || (searchSortObj.value)) {
                this.table.statePersistence.removeWidgetState(this.table, 'search');
                this.table.statePersistence.setWidgetState(this.table, {search: obj});
            } else {
                this.table.statePersistence.removeWidgetState(this.table, 'search');
            }
            if (!statePersistenceTriggered) {
                this.table.statePersistence.removeWidgetState(this.table, 'pagination');
                this.table.statePersistence.removeWidgetState(this.table, 'selectedItem');
            }
        } else {
            console.warn('Retain State handling on Widget ' + this.table.name + ' is not supported for current pagination type.');
        }
        let filterFields = getClonedObject(searchSortObj);
        const dataSource = this.table.datasource;
        if (!dataSource && !this.table.dataset) {
            return;
        }
        let output;
        const userFilters = {};
        // Transform filter fields from array to object having field names as keys
        if (isArray(filterFields)) {
            filterFields.forEach(filterField => {
                transformFilterField(userFilters, filterField);
            });
        } else {
            transformFilterField(userFilters, filterFields);
        }
        output = this.table.invokeEventCallback('beforefilter', {$event: e, $data: userFilters, columns: userFilters});
        // If callback returns false, don't trigger the filter call
        if (output === false) {
            return;
        }
        filterFields = [];
        // if the field is not selected in search filter dropdown, building the filter fields object
        if (isEmpty(userFilters) && !isEmpty(obj)) {
            if (isArray(obj)) {
                forEach(obj, searchObj => {
                    addToFilterFields(filterFields, searchObj);
                });
            } else {
                addToFilterFields(filterFields, obj);
            }
        } else {
            // Transform back the filter fields from object to array
            forEach(userFilters, (val, key) => {
                // @ts-ignore
                filterFields.push({field: key, matchMode: val.matchMode, type: val.type, value: val.value});
            });
        }
        if (dataSource && dataSource.execute(DataSource.Operation.SUPPORTS_SERVER_FILTER)) {
            this.handleServerSideSearch(filterFields);
            return;
        }
        if (dataSource && dataSource.execute(DataSource.Operation.IS_API_AWARE) && dataSource.execute(DataSource.Operation.IS_PAGEABLE)) {
            this.handleSinglePageSearch(filterFields);
        } else {
            this.handleClientSideSortSearch(filterFields, e, type);
        }
    }

    private sortHandler(searchSortObj, e, type, statePersistenceTriggered?) {
        const dataSource = this.table.datasource;
        if (!dataSource && !this.table.dataset) {
            return;
        }
        if (!statePersistenceTriggered && this.table.getConfiguredState() !== 'none' && unsupportedStatePersistenceTypes.indexOf(this.table.navigation) < 0) {
            const obj = {direction: searchSortObj.direction, field: searchSortObj.field};
            if (searchSortObj.direction) {
                this.table.statePersistence.setWidgetState(this.table, {sort: obj});
            } else {
                this.table.statePersistence.removeWidgetState(this.table, 'sort');
            }
            this.table.statePersistence.removeWidgetState(this.table, 'selectedItem');
        } else {
            console.warn('Retain State handling on Widget ' + this.table.name + ' is not supported for current pagination type.');
        }

        // WMS-22387: For server side pagination, execute client side sorting
        if (dataSource && dataSource.execute(DataSource.Operation.IS_SORTABLE)) {
            this.handleSeverSideSort(searchSortObj, e, statePersistenceTriggered);
        } else {
            this.handleClientSideSortSearch(searchSortObj, e, type);
        }
    }
    // set the 'lastAction' performed on the table to 'search_or_sort'
    setLastActionPerformedToSearchSort() {
        this.table.gridOptions.setLastActionPerformed(this.table.gridOptions.ACTIONS.SEARCH_OR_SORT);
        this.table.gridOptions.setIsSearchTrigerred(true);
    }

    // This method is triggered by jquery table
    searchSortHandler(searchSortObj, e, type, statePersistenceTriggered?) {
        const event_type = e ? e.type : '';
        if (event_type === 'change' && this.table.filtermode !== 'multicolumn') {
            e.stopPropagation();
        } else {
            this.setLastActionPerformedToSearchSort();
            if (type === 'search') {
                this.searchHandler(searchSortObj, e, type, statePersistenceTriggered);
            } else {
                this.sortHandler(searchSortObj, e, type, statePersistenceTriggered);
            }
        }
    }

    // Method to show/hide clear icon in multi column filter
    showClearIcon(fieldName) {
        const value = this.table.rowFilter[fieldName] && this.table.rowFilter[fieldName].value;
        return isDefined(value) && value !== '' && value !== null;
    }

    // Method clear the filter value in multi column filter
    clearRowFilter(fieldName) {
        if (this.table.rowFilter && this.table.rowFilter[fieldName]) {
            this.table.columns[fieldName].resetFilter();
            this.onRowFilterChange(fieldName);
        }
    }

    // This method is triggered on select of condition in multi column filter
    onFilterConditionSelect(fieldName, condition) {
        this.table.rowFilter[fieldName] = this.table.rowFilter[fieldName] || {};
        this.table.rowFilter[fieldName].matchMode = condition;
        // For empty match modes, clear off the value and call filter
        if (includes(this.table.emptyMatchModes, condition)) {
            this.table.columns[fieldName].resetFilter();
            this.table.onRowFilterChange();
        } else {
            // If value is present, call the filter. Else, focus on the field
            if (isDefined(this.table.rowFilter[fieldName].value) && this.table.rowFilter[fieldName].value !== '') {
                this.table.onRowFilterChange();
            } else {
                setTimeout(() => {
                    this.table.columns[fieldName].filterInstance.focus();
                });
            }
        }
    }

    // Method to get the updated values when filter on field is changed for multicolumn filter
    private getFilterOnFieldValues(filterDef) {
        if (!this.table.datasource || !this.table.datasource.execute(DataSource.Operation.SUPPORTS_DISTINCT_API)) {
            return;
        }

        const fieldName = filterDef.field;
        const formFields = this.table.fullFieldDefs;
        const filterOnFields = filter(formFields, {'filteronfilter': fieldName});
        const newVal = get(this.table.rowFilter, [fieldName, 'value']);

        // Loop over the fields for which the current field is filter on field
        forEach(filterOnFields, filterField => {
            const filterOn = filterField.filteronfilter;
            const filterKey = filterField.field;
            const filterFields = {};
            const filterWidget = filterField.filterwidget;

            if (!isDataSetWidget(filterWidget) || filterOn === filterKey || filterField.isFilterDataSetBound) {
                return;
            }

            filterFields[filterOn] = (isDefined(newVal) && newVal !== '' && newVal !== null) ? {'value' : newVal} : {};

            if (filterWidget === FormWidgetType.AUTOCOMPLETE && filterField.filterInstance.dataoptions) {
                filterField.filterInstance.dataoptions.filterFields = filterFields;
            } else {
                this.table.datasource.execute(DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS, {
                    'fields'         : filterKey,
                    'filterFields'   : filterFields
                }).then(data => {
                    filterField.filterdataset = data.data;
                });
            }
        });
    }

    // This method is triggered on value change in multi column filter
    onRowFilterChange(fieldName) {
        const searchObj = [];
        const field = find(this.table.fullFieldDefs, {'field': fieldName});
        // Convert row filters to a search object and call search handler
        forEach(this.table.rowFilter, (value, key) => {
            if ((isDefined(value.value) && value.value !== '') || includes(this.table.emptyMatchModes, value.matchMode)) {
                if (field && key === field.field) {
                    value.type      = value.type || field.type;
                    value.matchMode = value.matchMode || get(this.table.matchModeTypesMap[value.type], 0);
                }
                searchObj.push({
                    field: key,
                    value: value.value,
                    matchMode: value.matchMode,
                    type: value.type
                });
            }
        });
        this.table.gridOptions.searchHandler(searchObj, undefined, 'search');

        // If field is passed, update any filter on field values if present
        if (field) {
            this.getFilterOnFieldValues(field);
        }
    }

    refreshData(isSamePage) {
        if (!this.table.datasource) {
            return;
        }
        const page = isSamePage ? this.table.dataNavigator.dn.currentPage : 1;
        const sortInfo     = this.table.sortInfo;
        const sortOptions  = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
        const filterFields = this.getFilterFields(this.table.filterInfo);
        const logicalOp = this.getLogicalOperator(filterFields);
        refreshDataSource(this.table.datasource, {
            page: page,
            filterFields : filterFields,
            orderBy : sortOptions,
            condition : logicalOp
        });
    }
}
