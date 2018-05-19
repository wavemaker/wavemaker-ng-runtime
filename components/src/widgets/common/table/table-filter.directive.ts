import { Directive, Inject, Self } from '@angular/core';

import { TableComponent } from './table.component';
import { DataSource, getClonedObject, isDefined, isNumberType } from '@wm/core';
import { refreshDataSource } from '../../../utils/data-utils';

declare const _;
declare const moment;

// Get search value based on the time
const getSearchValue = (value, type) => {
    if (!isDefined(value) || value === '') {
        return undefined;
    }
    if (isNumberType(type)) {
        return _.toNumber(value);
    }
    if (type === 'datetime') {
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
    }

    getFilterFields(searchObj) {
        const filterFields = {};
        if (_.isArray(searchObj)) {
            _.forEach(searchObj, function (obj) {
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
        if (!_.isEmpty(this.table.sortInfo)) {
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
            // this.table.rowFilter = {};
            // if (!skipFilter) {
            //     this.table.onRowFilterChange();
            // }
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

    handleClientSideSortSearch(searchSortObj, e, type) {
        this.table._isClientSearch = true;

        let data;
        data = this.table.shownavigation ? getClonedObject(this.table.__fullData) : getClonedObject(this.table.dataset);
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
        if (this.table.shownavigation) {
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

    handleSinglePageSearch(searchObj) {
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

    handleServerSideSearch(searchObj) {
        this.table.filterInfo = searchObj;

        const sortInfo     = this.table.sortInfo;
        const sortOptions  = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
        const filterFields = this.getFilterFields(searchObj);
        refreshDataSource(this.table.datasource, {
            'page': 1,
            'filterFields' : filterFields,
            'orderBy' : sortOptions
        }).then(() => {}, () => {
            this.table.toggleMessage(true, 'error', this.table.nodatamessage);
        });
    }

    handleSeverSideSort(sortObj, e) {
        // Update the sort info for passing to datagrid
        this.table.gridOptions.sortInfo.field = sortObj.field;
        this.table.gridOptions.sortInfo.direction = sortObj.direction;
        this.table.sortInfo = getClonedObject(sortObj);

        const sortOptions  = sortObj && sortObj.direction ? (sortObj.field + ' ' + sortObj.direction) : '';
        const filterFields = this.getFilterFields(this.table.filterInfo);

        refreshDataSource(this.table.datasource, {
            'page' : 1,
            'filterFields' : filterFields,
            'orderBy' : sortOptions
        }).then(() => {
            this.table.invokeEventCallback('sort', {$event: e, $data: this.table.serverData});
        }, (error) => {
            this.table.toggleMessage(true, 'error', error);
        });
    }

    searchHandler(searchSortObj, e, type) {
        const dataSource = this.table.datasource;
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

    sortHandler(searchSortObj, e, type) {
        const dataSource = this.table.datasource;
        if (dataSource.execute(DataSource.Operation.IS_PAGEABLE)) {
            this.handleSeverSideSort(searchSortObj, e);
        } else {
            this.handleClientSideSortSearch(searchSortObj, e, type);
        }
    }

    searchSortHandler(searchSortObj, e, type) {
        if (type === 'search') {
            this.searchHandler(searchSortObj, e, type);
        } else {
            this.sortHandler(searchSortObj, e, type);
        }
    }
}

