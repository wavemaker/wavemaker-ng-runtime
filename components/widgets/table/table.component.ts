import { Component, ViewChild, AfterContentInit, ElementRef, Injector, ChangeDetectorRef, OnInit } from '@angular/core';
import { TableParent, provideTheParent } from './parent';
import { PaginationComponent } from '../pagination/pagination.component';
import { styler } from '../../utils/styler';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './table.props';
import { isDefined, getClonedObject, isEmptyObject, isNumberType, getValidJSON } from '@utils/utils';
import { getRowOperationsColumn } from '../../utils/live-utils';

declare const _;
declare const moment;
declare var $: any;

registerProps();

const DEFAULT_CLS = 'app-grid app-panel panel';
const WIDGET_CONFIG = {widgetType: 'wm-table', hostClass: DEFAULT_CLS};

const rowOperations = {
    'update': {
        'config': {
            'label': 'Update',
            'value': 'update'
        },
        'property': 'updaterow'
    },
    'delete': {
        'config': {
            'label': 'Delete',
            'value': 'delete'
        },
        'property': 'deleterow'
    }
};

@Component({
    selector: '[wmTable]',
    templateUrl: './table.component.html',
    providers: [provideTheParent(TableParent, TableComponent)]
})
export class TableComponent extends BaseComponent implements TableParent, AfterContentInit, OnInit {

    @ViewChild(PaginationComponent) dataNavigator;
    @ViewChild('datagridElement') private _tableElement: ElementRef;

    title;
    subheading;
    iconclass;
    gridclass;
    nodatamessage;
    loadingdatamsg;
    gridfirstrowselect;
    filtermode;
    navigation;
    pagesize;
    showheader;
    multiselect;
    radioselect;
    showrowindex;
    enablesort = true;
    enablecolumnselection;
    showrecordcount;
    navigationalign;

    public selectedItems;
    public items = [];

    public shownavigation = false;
    public navControls = 'Basic';

    public datagridElement;

    public actions = [];
    public _actions = {
        'header': [],
        'footer': []
    };
    public rowActions = [];
    public exportOptions = [];
    private _dataset;
    get dataset() {
        return this._dataset;
    }

    set dataset(val) {
        this._dataset = val;
        this.watchVariableDataSet(val);
    }

    private fullFieldDefs = [];
    private fieldDefs = [];
    private __fullData;
    private dataNavigatorWatched;
    private navigatorResultWatch;
    private navigatorMaxResultWatch;
    private gridVariable;
    private filterInfo;
    private sortInfo;
    private serverData;
    private isBoundToLiveVariableRoot;
    private filternullrecords;
    private variableInflight;
    public headerConfig = [];

    private gridOptions = {
        'data': [],
        'colDefs': [],
        'startRowIndex': 1,
        'sortInfo': {
            'field': '',
            'direction': ''
        },
        'rowActions': [],
        'headerConfig': [],
        'rowClass': '',
        'editmode': '',
        'formPosition': '',
        'isMobile': false,
        'dateFormat': '',
        'timeFormat': '',
        'name': 'UserTable1',
        'messages': {
            'selectField': 'Select Field'
        },
        onDataRender: () => {
            // select rows selected in previous pages. (Not finding intersection of data and selecteditems as it will be heavy)
            if (!this.multiselect) {
                this.items.length = 0;
            }
            this.callDataGridMethod('selectRows', this.items);
            this.selectedItems = this.callDataGridMethod('getSelectedRows');
        },
        onRowSelect: (rowData, e) => {
            this.selectedItems = this.callDataGridMethod('getSelectedRows');
            /*
             * in case of single select, update the items with out changing the reference.
             * for multi select, keep old selected items in tact
             */
            if (this.multiselect) {
                if (_.findIndex(this.items, rowData) === -1) {
                    this.items.push(rowData);
                }
            } else {
                this.items.length = 0;
                this.items.push(rowData);
            }
        },
        onRowDblClick: () => {
        },
        onRowDeselect: (rowData, e) => {
            if (this.multiselect) {
                this.items = _.pullAllWith(this.items, [rowData], _.isEqual);
                this.selectedItems = this.callDataGridMethod('getSelectedRows');
            }
        },
        onColumnSelect: () => {
        },
        onColumnDeselect: () => {
        },
        onHeaderClick: () => {
        },
        onRowDelete: () => {
        },
        onRowInsert: () => {
        },
        beforeRowUpdate: () => {
        },
        afterRowUpdate: () => {
        },
        onBeforeRowUpdate: () => {
        },
        onBeforeRowInsert: () => {
        },
        onFormRender: () => {
        },
        onBeforeFormRender: () => {
        },
        getCompiledTemplate: () => {
        },
        compileTemplateInGridScope: () => {
        },
        getBindDataSet: () => {
        },
        setGridEditMode: () => {
        },
        setGridState: () => {
        },
        noChangesDetected: () => {
        },
        afterSort: () => {
        },
        // Function to loop through events and trigger
        handleCustomEvents: () => {
        },
        // Function to redraw the widgets on resize of columns
        redrawWidgets: () => {
        },
        searchHandler: this.handleOperation.bind(this),
        sortHandler: this.handleOperation.bind(this),
        timeoutCall: () => {
        },
        safeApply: () => {
        }
    };

    private _gridData;
    set gridData(newValue) {
        this._gridData = newValue;
        const startRowIndex = 0;
        let gridOptions;

        if (isDefined(newValue)) {
            /*Setting the serial no's only when show navigation is enabled and data navigator is compiled
             and its current page is set properly*/
            // if (this.shownavigation && this.dataNavigator && this.dataNavigator.dn.currentPage) {
            //     startRowIndex = ((this.dataNavigator.dn.currentPage - 1) * ($is.dataNavigator.maxResults || 1)) + 1;
            //     this.setDataGridOption('startRowIndex', startRowIndex);
            // }
            /* If colDefs are available, but not already set on the datagrid, then set them.
             * This will happen while switching from markup to design tab. */
            gridOptions = this.callDataGridMethod('getOptions');

            if (!gridOptions) {
                return;
            }

            if (!gridOptions.colDefs.length && this.fieldDefs.length) {
                this.setDataGridOption('colDefs', getClonedObject(this.fieldDefs));
            }
            // Map the col defs to columns
            // _.map(gridOptions.colDefs, function (column) {
            //     this.columns[column.field] = column;
            // });
            // If data and colDefs are present, call on before data render event
            // if (!_.isEmpty(newValue) && gridOptions.colDefs.length) {
            //     $is.onBeforedatarender({$isolateScope: $is, $data: newValue, $columns: $is.columns});
            // }
            this.setDataGridOption('data', getClonedObject(newValue));
        }
    }

    get gridData() {
        return this._gridData;
    }

    get selecteditem() {
        if (this.multiselect) {
            return this.items;
        }
        if (_.isEmpty(this.items)) {
            return {};
        }
        return this.items[0];
    }

    set selecteditem(val) {
        // Select the rows in the table based on the new selected items passed
        this.items.length = 0;
        this.callDataGridMethod('selectRows', val);
    }

    /* Check whether it is non-empty row. */
    isEmptyRecord(record) {
        const properties = Object.keys(record);
        let data,
            isDisplayed;

        return properties.every((prop, index) => {
            data = record[prop];
            /* If fieldDefs are missing, show all columns in data. */
            /* TODO: Add mobile check*/
            isDisplayed = (this.fieldDefs.length && isDefined(this.fieldDefs[index]) &&
                (this.fieldDefs[index].pcDisplay)) || true;
            /*Validating only the displayed fields*/
            if (isDisplayed) {
                return (data === null || data === undefined || data === '');
            }
            return true;
        });
    }

    /* Function to remove the empty data. */
    removeEmptyRecords(serviceData) {
        const allRecords = serviceData.data || serviceData;
        let filteredData = [];
        if (allRecords && allRecords.length) {
            /*Comparing and pushing the non-empty data columns*/
            filteredData = allRecords.filter((record) => {
                return record && !this.isEmptyRecord(record);
            });
        }
        return filteredData;
    }

    setGridData(serverData, forceSet = false) {
        let data = serverData;
        /*If serverData has data but is undefined, then return*/
        if (!forceSet && (this.isBoundToLiveVariableRoot || isDefined(serverData.propertiesMap))) {
            if (!serverData.data || isEmptyObject(serverData.data)) {
                return;
            }
            data = serverData.data;
        }
        if (this.filternullrecords) {
            this.gridData = this.removeEmptyRecords(data);
        } else {
            this.gridData = data;
        }
        if (!this.variableInflight) {
            if (this.gridData && this.gridData.length === 0) {
                this.callDataGridMethod('setStatus', 'nodata', this.nodatamessage);
            } else {
                this.callDataGridMethod('setStatus', 'ready');
            }
        }
    }

    // Get search value based on the time
    getSearchValue(value, type) {
        if (isNumberType(type)) {
            return _.toNumber(value);
        }
        if (type === 'datetime') {
            return moment(value).valueOf();
        }
        return _.toString(value).toLowerCase();
    }

    // Filter the data based on the search value and conditions
    getFilteredData(data, searchObj) {
        const searchVal = this.getSearchValue(searchObj.value, searchObj.type);
        let currentVal;
        data = data.filter((obj) => {
            let isExists;
            if (searchObj.field) {
                currentVal = this.getSearchValue(_.get(obj, searchObj.field), searchObj.type);
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
    }

    getSearchResult(data, searchObj) {
        if (!searchObj) {
            return data;
        }
        if (_.isArray(searchObj)) {
            searchObj.forEach((obj) => {
                data = this.getFilteredData(data, obj);
            });
        } else {
            data = this.getFilteredData(data, searchObj);
        }
        return data;
    }

    /*Returns data sorted using sortObj*/
    getSortResult(data, sortObj) {
        if (sortObj && sortObj.direction) {
            data = _.orderBy(data, sortObj.field, sortObj.direction);
        }
        return data;
    }

    handleOperation(searchSortObj, e, type) {
        let data;
        data = this.shownavigation ? getClonedObject(this.__fullData) : getClonedObject(this.dataset);
        if (type === 'search') {
            this.filterInfo = searchSortObj;
        } else {
            this.sortInfo = searchSortObj;
        }
        if (_.isObject(data) && !_.isArray(data)) {
            data = [data];
        }
        /*Both the functions return same 'data' if arguments are undefined*/
        data = this.getSearchResult(data, this.filterInfo);
        data = this.getSortResult(data, this.sortInfo);
        this.serverData = data;
        if (this.shownavigation) {
            // Reset the page number to 1
            this.dataNavigator.dn.currentPage = 1;
            this.dataNavigator.setPagingValues(data);
        } else {
            this.setGridData(this.serverData);
        }

        if (type === 'sort') {
            // Calling 'onSort' event
            // $is.onSort({$event: e, $data: this.serverData});
        }
    }

    setDataGridOption(optionName, newVal, forceSet = false) {
        if (!this.datagridElement || !this.datagridElement.datatable || !this.datagridElement.datatable('instance')) {
            return;
        }
        const option = {};
        if (isDefined && (!_.isEqual(newVal, this.gridOptions[optionName]) || forceSet)) {
            option[optionName] = newVal;
            this.datagridElement.datatable('option', option);
            this.gridOptions[optionName] = newVal;
        }
    }

    callDataGridMethod(...args) {
        if (!this.datagridElement || !this.datagridElement.datatable('instance')) {
            return; // If datagrid is not initiliazed or destroyed, return here
        }
        return this.datagridElement.datatable.apply(this.datagridElement, args);
    }

    renderOperationColumns(fromDesigner = false) {
        let rowActionCol,
            insertPosition;

        const opConfig = {},
            operations = [],
            rowOperationsColumn = getRowOperationsColumn(),
            config = {
                'name': rowOperationsColumn.field,
                'field': rowOperationsColumn.field,
                'isPredefined': true
            };
        // Return if no fieldDefs are present
        if (!this.fieldDefs.length) {
            return;
        }

        rowActionCol = _.find(this.fullFieldDefs, {'field': 'rowOperations', type: 'custom'}); // Check if column is fetched from markup
        _.remove(this.fieldDefs, {type: 'custom', field: 'rowOperations'}); // Removing operations column
        _.remove(this.headerConfig, {field: rowOperationsColumn.field});

        // Loop through the "rowOperations"
        _.forEach(rowOperations, (field, fieldName) => {
            /* Add it to operations only if the corresponding property is enabled.*/
            if (_.some(this.rowActions, {'key': field.property}) || (!fromDesigner && this[field.property])) {
                opConfig[fieldName] = rowOperations[fieldName].config;
                operations.push(fieldName);
            }
        });

        /*Add the column for row operations only if at-least one operation has been enabled.*/
        if (this.rowActions.length) {
            if (rowActionCol) { // If column is present in markup, push the column or push the default column
                insertPosition = rowActionCol.rowactionsposition ? _.toNumber(rowActionCol.rowactionsposition) : this.fieldDefs.length;
                this.fieldDefs.splice(insertPosition, 0, rowActionCol);
                if (insertPosition === 0) {
                    this.headerConfig.unshift(config);
                } else {
                    this.headerConfig.push(config);
                }
            } else {
                this.fieldDefs.push(rowOperationsColumn);
                this.headerConfig.push(config);
            }
        } else if (!fromDesigner && operations.length) {
            rowOperationsColumn.operations = operations;
            rowOperationsColumn.opConfig = opConfig;
            this.fieldDefs.push(rowOperationsColumn);
            this.headerConfig.push(config);
        }
        this.setDataGridOption('headerConfig', this.headerConfig);
    }

    enablePageNavigation() {
        if (this.dataset && !_.isEmpty(this.dataset)) {
            /*Check for sanity*/
            if (this.dataNavigator) {
                this.dataNavigatorWatched = true;

                if (this.navigatorResultWatch) {
                    this.navigatorResultWatch.unsubscribe();
                }
                /*Register a watch on the "result" property of the "dataNavigator" so that the paginated data is displayed in the live-list.*/
                this.navigatorResultWatch = this.dataNavigator.resultEmitter.subscribe((newVal) => {
                    /* Check for sanity. */
                    if (isDefined(newVal)) {
                        // Watch will not be triggered if dataset and new value are equal. So trigger the property change handler manually
                        // This happens in case, if dataset is directly updated.
                        if (_.isEqual(this.dataset, newVal)) {
                            this.watchVariableDataSet(newVal);
                        } else {
                            if (_.isArray(newVal)) {
                                this.dataset = [].concat(newVal);
                            } else if (_.isObject(newVal)) {
                                this.dataset = _.extend({}, newVal);
                            } else {
                                this.dataset = newVal;
                            }
                        }
                    } else {
                        this.dataset = undefined;
                    }
                }, true);
                /*De-register the watch if it is exists */
                if (this.navigatorMaxResultWatch) {
                    this.navigatorMaxResultWatch.unsubscribe();
                }
                /*Register a watch on the "maxResults" property of the "dataNavigator" so that the "pageSize" is displayed in the live-list.*/
                this.navigatorMaxResultWatch = this.dataNavigator.maxResultsEmitter.subscribe((newVal) => {
                    this.pagesize = newVal;
                });
                // If dataset is a pageable object, data is present inside the content property
                this.__fullData = this.dataset;

                this.dataNavigator.maxResults = this.pagesize || 5;
                this.dataNavigator.dataset = this.dataset;
            }
        }
    }

    resetPageNavigation() {
        /*Check for sanity*/
        if (this.dataNavigator) {
            this.dataNavigator.resetPageNavigation();
        }
    }

    isDataValid() {
        let error;
        const dataset = this.dataset || {};

        /*In case "data" contains "error" & "errorMessage", then display the error message in the grid.*/
        if (dataset.error) {
            error = dataset.error;
        }
        if (dataset.data && dataset.data.error) {
            if (dataset.data.errorMessage) {
                error = dataset.data.errorMessage;
            }
        }
        if (error) {
            this.setGridData([]);
            this.callDataGridMethod('setStatus', 'error', error);
            return false;
        }
        return true;
    }

    /* Function to populate the grid with data. */
    populateGridData(serviceData) {
        /*Allowing when the data is directly given to the dataset*/
        this.serverData = serviceData;
        /*check if new column defs required*/
        this.setGridData(this.serverData);
    }

    watchVariableDataSet(newVal) {
        let result;
        // After the setting the watch on navigator, dataset is triggered with undefined. In this case, return here.
        if (this.dataNavigatorWatched && _.isUndefined(newVal) && this.__fullData) {
            return;
        }
        // If variable is in loading state, show loading icon
        if (this.variableInflight) {
            this.callDataGridMethod('setStatus', 'loading', this.loadingdatamsg);
        }

        result = getValidJSON(newVal);

        /*Reset the values to undefined so that they are calculated each time.*/
        this.gridVariable = '';

        // Converting newval to object if it is an Object that comes as a string "{"data" : 1}"
        if (result) {
            newVal = result;
        }

        /*Return if data is invalid.*/
        if (!this.isDataValid()) {
            return;
        }

        // If value is empty or in studio mode, dont enable the navigation
        if (newVal && !_.isEmpty(newVal)) {
            if (this.shownavigation && !this.dataNavigatorWatched) {
                this.enablePageNavigation();
                return;
            }
        } else {
            this.resetPageNavigation();
            /*for run mode, disabling the loader and showing no data found message if dataset is not valid*/
            this.callDataGridMethod('setStatus', 'nodata', this.nodatamessage);
            this.setDataGridOption('selectFirstRow', this.gridfirstrowselect);
        }

        if (newVal) {
            this.populateGridData(newVal);
        }
    }

    onPropertyChange(key: string, newVal) {
        switch (key) {
            case 'gridclass':
                this.callDataGridMethod('option', 'cssClassNames.grid', newVal);
                break;
            case 'filtermode':
                this.setDataGridOption('filtermode', newVal);
                break;
            case 'navigation':
                if (newVal === 'Advanced') { // Support for older projects where navigation type was advanced instead of clasic
                    this.navigation = 'Classic';
                    return;
                }
                if (newVal !== 'None') {
                    this.shownavigation = true;
                    // this.enablePageNavigation();
                }
                this.navControls = newVal;
                break;
            case 'showheader':
                this.setDataGridOption('showHeader', newVal);
                break;
            case 'multiselect':
                this.setDataGridOption('multiselect', newVal);
                break;
            case 'radioselect':
                this.setDataGridOption('showRadioColumn', newVal);
                break;
            case 'showrowindex':
                this.setDataGridOption('showRowIndex', newVal);
                break;
            case 'gridfirstrowselect':
                this.setDataGridOption('selectFirstRow', newVal);
                break;
        }
    }

    populateActions() {
        this._actions.header = [];
        this._actions.footer = [];
        _.forEach(this.actions, (action) => {
            if (_.includes(action.position, 'header')) {
                this._actions.header.push(action);
            }
            if (_.includes(action.position, 'footer')) {
                this._actions.footer.push(action);
            }
        });
    }

    ngAfterContentInit() {
        const runModeInitialProperties = {
            'showrowindex': 'showRowIndex',
            'multiselect': 'multiselect',
            'radioselect': 'showRadioColumn',
            'filternullrecords': 'filterNullRecords',
            'enablesort': 'enableSort',
            'showheader': 'showHeader',
            'enablecolumnselection': 'enableColumnSelection',
            'shownewrow': 'showNewRow'
        };

        this.gridOptions.colDefs = this.fullFieldDefs;
        this.gridOptions.headerConfig = this.headerConfig;
        this.datagridElement = $(this._tableElement.nativeElement);

        _.forEach(runModeInitialProperties, (value, key) => {
            if (isDefined(this[key])) {
                this.gridOptions[value] = (this[key] === 'true' || this[key] === true);
            }
        });

        this.renderOperationColumns();

        this.datagridElement.datatable(this.gridOptions);
        this.watchVariableDataSet(this.dataset);
    }

    registerColumns(tableColumn) {
        this.fieldDefs.push(tableColumn);
        this.fullFieldDefs.push(tableColumn);
    }

    registerActions(tableAction) {
        this.actions.push(tableAction);
        this.populateActions();
    }

    registerRowActions(tableRowAction) {
        this.rowActions.push(tableRowAction);
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
