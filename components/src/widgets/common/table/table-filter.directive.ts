import { Directive, Inject, Self } from '@angular/core';

import { $appDigest, DataSource, DataType, FormWidgetType, getClonedObject, isDefined, isNumberType } from '@wm/core';

import { TableComponent } from './table.component';
import { refreshDataSource } from '../../../utils/data-utils';
import { getMatchModeMsgs, getMatchModeTypesMap, isDataSetWidget } from '../../../utils/widget-utils';

declare const _;
declare const moment;

const emptyMatchModes = ['null', 'empty', 'nullorempty', 'isnotnull', 'isnotempty'];

// Get search value based on the time
const getSearchValue = (value, type) => {
    if (!isDefined(value) || value === '') {
        return undefined;
    }
    if (isNumberType(type)) {
        return _.toNumber(value);
    }
    if (type === DataType.DATETIME) {
        return moment(value).valueOf();
    }
    return _.toString(value).toLowerCase();
};

// Filter the data based on the search value and conditions
const getFilteredData = (data, searchObj) => {
    const searchVal = getSearchValue(searchObj.value, searchObj.type);
    let currentVal;
    if (!isDefined(searchVal)) {
        return data;
    }
    data = data.filter((obj) => {
        let isExists;
        if (searchObj.field) {
            currentVal = getSearchValue(_.get(obj, searchObj.field), searchObj.type);
        } else {
            currentVal = _.values(obj).join(' ').toLowerCase(); // If field is not there, search on all the columns
        }
        switch (searchObj.matchMode) {
            case 'start':
                isExists = _.startsWith(currentVal, searchVal as string);
                break;
            case 'end':
                isExists = _.endsWith(currentVal, searchVal as string);
                break;
            case 'exact':
                isExists = _.isEqual(currentVal, searchVal);
                break;
            case 'notequals':
                isExists = !_.isEqual(currentVal, searchVal);
                break;
            case 'null':
                isExists = _.isNull(currentVal);
                break;
            case 'isnotnull':
                isExists = !_.isNull(currentVal);
                break;
            case 'empty':
                isExists = _.isEmpty(currentVal);
                break;
            case 'isnotempty':
                isExists = !_.isEmpty(currentVal);
                break;
            case 'nullorempty':
                isExists = _.isNull(currentVal) || _.isEmpty(currentVal);
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
                isExists = isNumberType(searchObj.type) ? _.isEqual(currentVal, searchVal) : _.includes(currentVal, searchVal);
                break;
        }
        return isExists;
    });
    return data;
};

// Set the filter fields as required by datasource
const setFilterFields = (filterFields, searchObj) => {
    const field = searchObj && searchObj.field;
    /*Set the filter options only when a field/column has been selected.*/
    if (field) {
        filterFields[field] = {
            'value'     : searchObj.value,
            'logicalOp' : 'AND'
        };
        if (searchObj.matchMode) {
            filterFields[field].matchMode = searchObj.matchMode;
        }
    }
};

@Directive({
    selector: '[wmTableFilterSort]'
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
    }

    // Get first or last page based on sort info of primary key
    getNavigationTargetBySortInfo() {
        return this.table.sortInfo && this.table.sortInfo.direction === 'desc' &&
                    _.includes(this.table.primaryKey, this.table.sortInfo.field) ? 'first' : 'last';
    }

    // Get the filter fields as required by datasource
    getFilterFields(searchObj) {
        const filterFields = {};
        if (_.isArray(searchObj)) {
            _.forEach(searchObj,  obj => {
                setFilterFields(filterFields, obj);
            });
        } else {
            setFilterFields(filterFields, searchObj);
        }
        return filterFields;
    }

    // Reset the sort based on sort returned by the call
    resetSortStatus(variableSort) {
        let gridSortString;
        if (!_.isEmpty(this.table.sortInfo) && this.table.datasource) {
            gridSortString = this.table.sortInfo.field + ' ' + this.table.sortInfo.direction;
            variableSort = this.table.datasource.execute(DataSource.Operation.GET_OPTIONS).orderBy || variableSort;
            if (variableSort) { // If multiple order by fields are present, compare with the first one
                variableSort = _.head(_.split(variableSort, ','));
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
                col.resetFilter();
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
            if (_.isEmpty(this.table.datasource.execute(DataSource.Operation.GET_OPTIONS).filterFields)) {
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
        if (!searchObj) {
            return data;
        }
        if (_.isArray(searchObj)) {
            searchObj.forEach((obj) => {
                data = getFilteredData(data, obj);
            });
        } else {
            data = getFilteredData(data, searchObj);
        }
        return data;
    }

    // Returns data sorted using sortObj
    getSortResult(data, sortObj) {
        if (sortObj && sortObj.direction) {
            data = _.orderBy(data, sortObj.field, sortObj.direction);
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
        if (_.isObject(data) && !_.isArray(data)) {
            data = [data];
        }
        /*Both the functions return same 'data' if arguments are undefined*/
        data = this.getSearchResult(data, this.table.filterInfo);
        data = this.getSortResult(data, this.table.sortInfo);
        this.table.serverData = data;
        if (this.table.isNavigationEnabled()) {
            // Reset the page number to 1
            this.table.dataNavigator.dn.currentPage = 1;
            this.table.dataNavigator.setPagingValues(data);
        } else {
            this.table.setGridData(this.table.serverData);
        }

        if (type === 'sort') {
            // Calling 'onSort' event
            this.table.invokeEventCallback('sort', {$event: e, $data: this.table.serverData});
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
        _.forEach(this.table.gridData, (value, index) => {
            const $row = $($rows[index]);
            if (_.find(data, obj => _.isEqual(obj, value))) {
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

        const sortInfo     = this.table.sortInfo;
        const sortOptions  = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
        const filterFields = this.getFilterFields(searchObj);
        refreshDataSource(this.table.datasource, {
            page: 1,
            filterFields : filterFields,
            orderBy : sortOptions
        }).then(() => {
            $appDigest();
        }, () => {
            this.table.toggleMessage(true, 'error', this.table.nodatamessage);
        });
    }

    // This method handles the sort for server side variables
    private handleSeverSideSort(sortObj, e) {
        // Update the sort info for passing to datagrid
        this.table.gridOptions.sortInfo.field = sortObj.field;
        this.table.gridOptions.sortInfo.direction = sortObj.direction;
        this.table.sortInfo = getClonedObject(sortObj);

        const sortOptions  = sortObj && sortObj.direction ? (sortObj.field + ' ' + sortObj.direction) : '';
        const filterFields = this.getFilterFields(this.table.filterInfo);

        refreshDataSource(this.table.datasource, {
            page : 1,
            filterFields : filterFields,
            orderBy : sortOptions
        }).then(() => {
            $appDigest();
            this.table.invokeEventCallback('sort', {$event: e, $data: this.table.serverData});
        }, (error) => {
            this.table.toggleMessage(true, 'error', error);
        });
    }

    private searchHandler(searchSortObj, e, type) {
        const dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        if (dataSource.execute(DataSource.Operation.SUPPORTS_SERVER_FILTER)) {
            this.handleServerSideSearch(searchSortObj);
            return;
        }
        if (dataSource.execute(DataSource.Operation.IS_API_AWARE) && dataSource.execute(DataSource.Operation.IS_PAGEABLE)) {
            this.handleSinglePageSearch(searchSortObj);
        } else {
            this.handleClientSideSortSearch(searchSortObj, e, type);
        }
    }

    private sortHandler(searchSortObj, e, type) {
        const dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        if (dataSource.execute(DataSource.Operation.IS_PAGEABLE)) {
            this.handleSeverSideSort(searchSortObj, e);
        } else {
            this.handleClientSideSortSearch(searchSortObj, e, type);
        }
    }

    // This method is triggered by jquery table
    searchSortHandler(searchSortObj, e, type) {
        if (type === 'search') {
            this.searchHandler(searchSortObj, e, type);
        } else {
            this.sortHandler(searchSortObj, e, type);
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
        if (_.includes(this.table.emptyMatchModes, condition)) {
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
        const filterOnFields = _.filter(formFields, {'filteronfilter': fieldName});
        const newVal = _.get(this.table.rowFilter, [fieldName, 'value']);

        // Loop over the fields for which the current field is filter on field
        _.forEach(filterOnFields, filterField => {
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
        const field = _.find(this.table.fullFieldDefs, {'field': fieldName});
        // Convert row filters to a search object and call search handler
        _.forEach(this.table.rowFilter, (value, key) => {
            if ((isDefined(value.value) && value.value !== '') || _.includes(this.table.emptyMatchModes, value.matchMode)) {
                if (field && key === field.field) {
                    value.type      = value.type || field.type;
                    value.matchMode = value.matchMode || _.get(this.table.matchModeTypesMap[value.type], 0);
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
        const page = isSamePage ? this.table.dataNavigator.dn.currentPage : 1;
        const sortInfo     = this.table.sortInfo;
        const sortOptions  = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
        const filterFields = this.getFilterFields(this.table.filterInfo);
        refreshDataSource(this.table.datasource, {
            page: page,
            filterFields : filterFields,
            orderBy : sortOptions
        });
    }
}

