import { AfterContentInit, Attribute, Component, ElementRef, Injector, TemplateRef, ViewChild, ViewContainerRef, ContentChildren, QueryList } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { $appDigest, DataSource, getClonedObject, getValidJSON, isDefined, isEmptyObject, isPageable, triggerFn } from '@wm/core';

import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { registerProps } from './table.props';
import { getRowOperationsColumn } from '../../../utils/live-utils';
import { refreshDataSource, transformData } from '../../../utils/data-utils';
import { getOrderByExpr, provideAsWidgetRef } from '../../../utils/widget-utils';

declare const _;
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

const exportIconMapping = {
    'EXCEL' : 'fa fa-file-excel-o',
    'CSV'   : 'fa fa-file-text-o'
};

const ROW_OPS_FIELD = 'rowOperations';

const noop = () => {};

@Component({
    selector: '[wmTable]',
    templateUrl: './table.component.html',
    providers: [
        provideAsWidgetRef(TableComponent)
    ]
})
export class TableComponent extends StylableComponent implements AfterContentInit {

    @ViewChild(PaginationComponent) dataNavigator;

    @ViewChild('datagridElement') private _tableElement: ElementRef;
    @ViewChild('rowActions') rowActionsTmpl: TemplateRef<any>;
    @ViewChild('rowActionsContainer', {read: ViewContainerRef}) rowActionsContainer: ViewContainerRef;

    @ContentChildren('filterTmpl') filterTmpl: QueryList<any>;
    @ViewChild('multiColumnFilter', {read: ViewContainerRef}) multiColumnFilterTl: ViewContainerRef;

    columns = {};
    datagridElement;
    datasource;
    editmode;
    enablecolumnselection;
    enablesort = true;
    filtermode;
    formposition;
    gridclass;
    gridfirstrowselect;
    iconclass;
    isGridEditMode;
    loadingdatamsg;
    multiselect;
    name;
    navigation;
    navigationSize;
    navigationalign;
    nodatamessage;
    pagesize;
    prevData;
    primaryKey;
    radioselect;
    rowclass;
    rowngclass;
    selectedItems = [];
    showheader;
    showrecordcount;
    showrowindex;
    subheading;
    title;

    selectedItemChange = new Subject();
    selectedItemChange$ = this.selectedItemChange.asObservable();

    actions = [];
    _actions = {
        'header': [],
        'footer': []
    };
    exportOptions = [];
    exportdatasize;
    headerConfig = [];
    items = [];
    navControls = 'Basic';
    rowActions = [];
    shownavigation = false;
    dataset;
    _liveTableParent;

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
    private filternullrecords;
    private variableInflight;

    private applyProps = new Map();

    redraw = _.debounce(this._redraw, 150);

    // Filter and Sort Methods
    rowFilter: any = {};
    matchModeTypesMap;
    matchModeMsgs;
    emptyMatchModes;
    _searchSortHandler = noop;
    searchSortHandler = (...args) => { this._searchSortHandler.apply(this, args); };
    _isPageSearch;
    _isClientSearch;
    checkFiltersApplied: Function;
    getSearchResult: Function;
    getSortResult: Function;
    getFilterFields: Function;
    onRowFilterChange = noop;
    onFilterConditionSelect = noop;
    showClearIcon = noop;
    clearRowFilter = noop;

    private gridOptions = {
        'data': [],
        'colDefs': [],
        'startRowIndex': 1,
        'sortInfo': {
            'field': '',
            'direction': ''
        },
        'filtermode': '',
        'rowActions': [],
        'headerConfig': [],
        'rowClass': '',
        'rowNgClass': '',
        'editmode': '',
        'formPosition': '',
        'isMobile': false,
        'dateFormat': '',
        'timeFormat': '',
        'name': '',
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
            this.selectedItemChange.next(this.selectedItems);

            if (this.gridData.length) {
                this.invokeEventCallback('datarender', {$data: this.gridData});
            }
            // On render, apply the filters set for query service variable
            if (this._isPageSearch && this.filterInfo) {
                this.searchSortHandler(this.filterInfo, undefined, 'search');
            }

            $appDigest();
        },
        onRowSelect: (rowData, e) => {
            this.selectedItems = this.callDataGridMethod('getSelectedRows');
            this.selectedItemChange.next(this.selectedItems);

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
            $appDigest();
        },
        onRowDblClick: () => {
        },
        onRowDeselect: (rowData, e) => {
            if (this.multiselect) {
                this.items = _.pullAllWith(this.items, [rowData], _.isEqual);
                this.selectedItems = this.callDataGridMethod('getSelectedRows');
            }
            $appDigest();
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
        beforeRowUpdate: (rowData, eventName?) => {
            if (this._liveTableParent) {
                this._liveTableParent.updateRow(rowData, eventName);
            }
            this.prevData = getClonedObject(rowData);
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
        clearViewRef: () => {
            this.rowActionsContainer.clear();
        },
        getCompiledTemplate: () => {
            // TODO: Demo code. Need to change
            this.rowActionsContainer.createEmbeddedView(this.rowActionsTmpl);
            return $(this.nativeElement).find('.row__actions')[0];
        },
        generateFilterRow: () => {
            // Clear the view container ref
            this.multiColumnFilterTl.clear();
            // For all the columns inside the table, generate the compiled filter template
            this.filterTmpl.forEach((tmpl) => {
                this.multiColumnFilterTl.createEmbeddedView(tmpl, {
                    changeFn: this.onRowFilterChange.bind(this),
                    isDisabled: (fieldName) => {
                        return this.emptyMatchModes.indexOf(this.rowFilter[fieldName] && this.rowFilter[fieldName].matchMode) > -1;
                    }
                });
            });
        },
        getFilterWidget: (fieldName) => {
            // Move the generated filter template to the filter row
            return $(this.nativeElement).find(`.multi-column-filter [data-col-identifier='${fieldName}']`)[0];
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
        searchHandler: this.searchSortHandler.bind(this),
        sortHandler: this.searchSortHandler.bind(this),
        timeoutCall: () => {
        },
        safeApply: () => {
        }
    };

    private _gridData;
    set gridData(newValue) {
        this._gridData = newValue;
        let startRowIndex = 0;
        let gridOptions;

        if (isDefined(newValue)) {
            /*Setting the serial no's only when show navigation is enabled and data navigator is compiled
             and its current page is set properly*/
            if (this.shownavigation && this.dataNavigator && this.dataNavigator.dn.currentPage) {
                startRowIndex = ((this.dataNavigator.dn.currentPage - 1) * (this.dataNavigator.maxResults || 1)) + 1;
                this.setDataGridOption('startRowIndex', startRowIndex);
            }
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
            _.map(gridOptions.colDefs, column => {
                this.columns[column.field] = column;
            });
            // If data and colDefs are present, call on before data render event
            if (!_.isEmpty(newValue) && gridOptions.colDefs.length) {
                this.invokeEventCallback('beforedatarender', {$data: newValue, $columns: this.columns});
            }
            this.setDataGridOption('data', getClonedObject(newValue));
        }
    }

    get gridData() {
        return this._gridData || [];
    }

    get selecteditem() {
        if (this.multiselect) {
            return getClonedObject(this.items); // TODO: is cloning required?
        }
        if (_.isEmpty(this.items)) {
            return {};
        }
        return getClonedObject(this.items[0]);
    }

    set selecteditem(val) {
        // Select the rows in the table based on the new selected items passed
        this.items.length = 0;
        this.callDataGridMethod('selectRows', val);
    }

    constructor(inj: Injector, @Attribute('dataset.bind') public binddataset) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
        const runModeInitialProperties = {
            'showrowindex': 'showRowIndex',
            'multiselect': 'multiselect',
            'radioselect': 'showRadioColumn',
            'filternullrecords': 'filterNullRecords',
            'enablesort': 'enableSort',
            'showheader': 'showHeader',
            'enablecolumnselection': 'enableColumnSelection',
            'shownewrow': 'showNewRow',
            'gridfirstrowselect': 'selectFirstRow'
        };

        this.gridOptions.colDefs = this.fullFieldDefs;
        this.gridOptions.headerConfig = this.headerConfig;
        this.gridOptions.rowNgClass = this.rowngclass;
        this.gridOptions.rowClass = this.rowclass;
        this.gridOptions.editmode = this.editmode;
        this.gridOptions.formPosition = this.formposition;
        this.gridOptions.filtermode = this.filtermode;
        this.gridOptions.name = this.name;
        this.datagridElement = $(this._tableElement.nativeElement);

        _.forEach(runModeInitialProperties, (value, key) => {
            if (isDefined(this[key])) {
                this.gridOptions[value] = (this[key] === 'true' || this[key] === true);
            }
        });

        // This is expose columns property to user so that he can programatically use columns to do some custom logic
        this.gridOptions.colDefs.map(column => {
            this.columns[column.field] = column;
        });

        this.renderOperationColumns();
        this.gridOptions.colDefs = this.fieldDefs;

        this.datagridElement.datatable(this.gridOptions);
        this.callDataGridMethod('setStatus', 'loading', this.loadingdatamsg);

        this.watchVariableDataSet(this.dataset);

        this.applyProps.forEach(args => this.callDataGridMethod(...args));
    }

    execute(operation, options) {
        if ([DataSource.Operation.IS_API_AWARE, DataSource.Operation.IS_PAGEABLE, DataSource.Operation.SUPPORTS_SERVER_FILTER].includes(operation)) {
            return false;
        }
        return this.datasource.execute(operation, options);
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
        const allRecords = serviceData;
        let filteredData = [];
        if (allRecords && allRecords.length) {
            /*Comparing and pushing the non-empty data columns*/
            filteredData = allRecords.filter(record => {
                return record && !this.isEmptyRecord(record);
            });
        }
        return filteredData;
    }

    setGridData(serverData) {
        const data = serverData;
        // If serverData has data but is undefined, then return
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
            this.applyProps.set(args[1], args);
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

        rowActionCol = _.find(this.fullFieldDefs, {'field': ROW_OPS_FIELD, type: 'custom'}); // Check if column is fetched from markup
        _.remove(this.fieldDefs, {type: 'custom', field: ROW_OPS_FIELD}); // Removing operations column
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
                                this.widget.dataset = [].concat(newVal);
                            } else if (_.isObject(newVal)) {
                                this.widget.dataset = _.extend({}, newVal);
                            } else {
                                this.widget.dataset = newVal;
                            }
                        }
                    } else {
                        this.widget.dataset = undefined;
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

                this.dataNavigator.widget.maxResults = this.pagesize || 5;
                this.dataNavigator.pagingOptions = {
                    maxResults: this.pagesize || 5
                };
                this.removePropertyBinding('dataset');
                this.dataNavigator.setBindDataSet(this.binddataset, this.viewParent, this.datasource);
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

    // Function to populate the grid with data.
    populateGridData(serviceData) {
        let data;
        serviceData = transformData(serviceData, this.name);
        // Apply filter and sort, if data is refreshed through Refresh data method
        if (!this.shownavigation && this._isClientSearch) {
            data = getClonedObject(serviceData);
            data = this.getSearchResult(data, this.filterInfo);
            data = this.getSortResult(data, this.sortInfo);
            this.serverData = data;
        } else {
            this.serverData = serviceData;
        }
        /*check if new column defs required*/
        this.setGridData(this.serverData);
    }

    watchVariableDataSet(newVal) {
        let result;
        let sortExp;
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

        /*If the data is a pageable object, then display the content.*/
        if (_.isObject(newVal)) {
            if (isPageable(newVal)) {
                sortExp = getOrderByExpr(newVal.sort);
                newVal = newVal.content;
            } else {
                newVal = newVal.data || newVal;
            }
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

        if (!this.shownavigation) {
            this.checkFiltersApplied(sortExp);
        }

        // TODO: Handle selected item reference data

        if (newVal) {
            this.populateGridData(newVal);
        }
    }

    onDataSourceChange() {
        this.fieldDefs.forEach(col => {
           triggerFn(col.onDataSourceChange);
        });
    }

    onPropertyChange(key: string, newVal) {
        let enableNewRow;
        switch (key) {
            case 'datasource':
                this.watchVariableDataSet(this.dataset);
                this.onDataSourceChange();
                break;
            case 'dataset':
                if (!this.datasource) {
                    return;
                }
                this.watchVariableDataSet(newVal);
                break;
            case 'gridclass':
                this.callDataGridMethod('option', 'cssClassNames.grid', newVal);
                break;
            case 'filtermode':
                this.setDataGridOption('filtermode', newVal);
                break;
            case 'searchlabel':
                this.setDataGridOption('searchLabel', newVal);
                break;
            case 'rowngclass':
                this.setDataGridOption('rowNgClass', newVal);
                break;
            case 'rowclass':
                this.setDataGridOption('rowClass', newVal);
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
            case 'gridclass':
                this.callDataGridMethod('option', 'cssClassNames.grid', newVal);
                break;
            case 'nodatamessage':
                this.callDataGridMethod('option', 'dataStates.nodata', newVal);
                break;
            case 'loadingdatamsg':
                this.callDataGridMethod('option', 'dataStates.loading', newVal);
                break;
            case 'loadingicon':
                this.callDataGridMethod('option', 'loadingicon', newVal);
                break;
            case 'filternullrecords':
                this.callDataGridMethod('option', 'filterNullRecords', newVal);
                break;
            case 'spacing':
                this.callDataGridMethod('option', 'spacing', newVal);
                if (newVal === 'condensed') {
                    this.navigationSize = 'small';
                } else {
                    this.navigationSize = '';
                }
                break;
            case 'exportformat':
                this.exportOptions = [];
                if (newVal) {
                    // Populate options for export drop down menu
                    _.forEach(_.split(newVal, ','), type => {
                        this.exportOptions.push({
                            'label'      : type,
                            'icon'       : exportIconMapping[type]
                        });
                    });
                }
                break;
            case 'shownewrow':
                // Enable new row if shownew is true or addNewRow buton is present
                enableNewRow = newVal || _.some(this.actions, act => _.includes(act.action, 'addNewRow()'));
                this.callDataGridMethod('option', 'actionsEnabled.new', enableNewRow);
                break;
            case 'show':
                if (newVal) {
                    this.invokeEventCallback('show');
                } else {
                    this.invokeEventCallback('hide');
                }
                break;

        }
    }

    onStyleChange(key, nv) {
        switch (key) {
            case 'width':
                this.callDataGridMethod('setGridDimensions', 'width', nv);
                break;
            case 'height':
                this.callDataGridMethod('setGridDimensions', 'height', nv);
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

    registerColumns(tableColumn) {
        this.fieldDefs.push(tableColumn);
        this.fullFieldDefs.push(tableColumn);
        this.rowFilter[tableColumn.field] = {
            value: undefined
        };
    }

    registerActions(tableAction) {
        this.actions.push(tableAction);
        this.populateActions();
    }

    registerRowActions(tableRowAction) {
        this.rowActions.push(tableRowAction);
    }

    editRow(evt) {
        let row;
        if (evt && evt.target) {
            this.callDataGridMethod('toggleEditRow', evt, {'selectRow': true});
        } else {
            // For live form, call the update function with selected item
            if (this.editmode === 'form' || this.editmode === 'dialog') {
                row = evt || this.selectedItems[0];
                this.gridOptions.beforeRowUpdate(row);
            } else {
                // Wait for the selected item to get updated
                setTimeout(() => {
                    row = this.datagridElement.find('tr.active');
                    if (row.length) {
                        this.callDataGridMethod('toggleEditRow', undefined, {$row: row, action: 'edit'});
                    }
                });
            }
        }
    }

    addNewRow() {
        if (!this.isGridEditMode) { // If grid is already in edit mode, do not add new row
            this.callDataGridMethod('addNewRow');
            if (this._liveTableParent) {
                this._liveTableParent.addNewRow();
            }
        }
    }

    deleteRow(evt) {
        let row;
        if (evt && evt.target) {
            this.callDataGridMethod('deleteRowAndUpdateSelectAll', evt);
        } else {
            if (this._liveTableParent) {
                this._liveTableParent.deleteRow(this.selectedItems[0]);
                return;
            }
            // Wait for the selected item to get updated
            setTimeout(() => {
                row = evt || this.selectedItems[0];
                // deleteRecord(row);
            });
        }
    }

    onRecordDelete(callBack?) {
        let index;
        /*Check for sanity*/
        if (this.dataNavigator) {
            this.dataNavigator.dataSize -= 1;
            this.dataNavigator.calculatePagingValues();
            /*If the current page does not contain any records due to deletion, then navigate to the previous page.*/
            index = this.dataNavigator.pageCount < this.dataNavigator.dn.currentPage ? 'prev' : undefined;
            this.dataNavigator.navigatePage(index, null, true, () => {
                setTimeout(() => {
                    triggerFn(callBack);
                }, undefined, false);
            });
        }
    }

    getNavigationTargetBySortInfo() {
        return this.sortInfo && this.sortInfo.direction === 'desc' && _.includes(this.primaryKey, this.sortInfo.field) ? 'first' : 'last';
    }

    selectItem(item, data) {
        /* server is not updating immediately, so set the server data to success callback data */
        if (data) {
            this.serverData = data;
        }
        // TODO: For live variable, on update/insert while selecting the row, remove the keys with empty array
        if (_.isObject(item)) {
            item = _.omitBy(item, (value) => {
                return _.isArray(value) && _.isEmpty(value);
            });
        }
        this.callDataGridMethod('selectRow', item, true);
    }
    /* deselect the given item*/
    deselectItem(item) {
        this.callDataGridMethod('deselectRow', item);
    }

    selectItemOnSuccess(row, skipSelectItem, callBack) {
        /*$timeout is used so that by then $is.dataset has the updated value.
         * Selection of the item is done in the callback of page navigation so that the item that needs to be selected actually exists in the grid.*/
        /*Do not select the item if skip selection item is specified*/
        setTimeout(() => {
            if (!skipSelectItem) {
                this.selectItem(row, this.dataset && this.dataset.data);
            }
            triggerFn(callBack);
        }, undefined, false);
    }

    initiateSelectItem(index, row, skipSelectItem?, isStaticVariable?, callBack?) {
        /*index === "last" indicates that an insert operation has been successfully performed and navigation to the last page is required.
         * Hence increment the "dataSize" by 1.*/
        if (index === 'last') {
            if (!isStaticVariable) {
                this.dataNavigator.dataSize += 1;
            }
            /*Update the data in the current page in the grid after insert/update operations.*/
            if (!this.shownavigation) {
                index = 'current';
            }
        }
        /*Re-calculate the paging values like pageCount etc that could change due to change in the dataSize.*/
        this.dataNavigator.calculatePagingValues();
        this.dataNavigator.navigatePage(index, null, true, () => {
            if (this.shownavigation || isStaticVariable) {
                this.selectItemOnSuccess(row, skipSelectItem, callBack);
            }
        });
    }

    onDataNavigatorDataSetChange(nv) {
        let data,
            variableSort;
        if (_.isObject(nv) && isPageable(nv)) {
            variableSort = getOrderByExpr(nv.sort);
            this.__fullData = nv.content;
        } else {
            this.__fullData = nv;
        }
        this.checkFiltersApplied(variableSort);
        if (this._isClientSearch) {
            data = getClonedObject(this.__fullData);
            if (_.isObject(data) && !_.isArray(data)) {
                data = [data];
            }
            data = this.getSearchResult(data, this.filterInfo);
            data = this.getSortResult(data, this.sortInfo);
            return data;
        }
        return nv;
    }

    updateVariable(row?, callBack?) {
        const dataSource = this.datasource;
        // TODO: Filter
        // if (this.isBoundToFilter) {
        //     //If grid is bound to filter, call the apply fiter and update filter options
        //     if (!this.shownavigation) {
        //         refreshLiveFilter();
        //     }
        //     this.Widgets[this.widgetName].fetchDistinctValues();
        //     return;
        // }
        if (dataSource && !this.shownavigation) {
            refreshDataSource(dataSource, {
                page: 1
            }).then(() => {
                this.selectItemOnSuccess(row, true, callBack);
            });
        }
    }

    toggleMessage(show, type, msg, header) {
        // TODO: Use app notifcation
        if (show && msg) {
            // wmToaster.show(type, WM.isDefined(header) ? header : type.toUpperCase(), msg);
        } else {
            // wmToaster.hide();
        }
    }

    export($item) {
        let filterFields;
        const sortOptions = _.isEmpty(this.sortInfo) ? '' : this.sortInfo.field + ' ' + this.sortInfo.direction;
        const fields = [];
        let isValid;
        let requestData;
        this.fieldDefs.forEach(fieldDef => {
            // Do not add the row operation actions column to the exported file.
            if (fieldDef.field === ROW_OPS_FIELD) {
                return;
            }
            const option = {
                'header': fieldDef.displayName
            };
            // If column has exportexpression, then send form the expression as required by backend.
            // otherwise send the field name.
            if (fieldDef.exportexpression) {
                (<any>option).expression = '${' + fieldDef.exportexpression + '}';
            } else {
                (<any>option).field = fieldDef.field;
            }
            fields.push(option);
        });
        filterFields = this.getFilterFields(this.filterInfo);
        requestData = {
            'matchMode'    : 'anywhere',
            'filterFields' : filterFields,
            'orderBy'      : sortOptions,
            'exportType'   : $item.label,
            'logicalOp'    : 'AND',
            'size'         : this.exportdatasize,
            'fields'       : fields
        };
        isValid = this.invokeEventCallback('beforeexport', {$data: requestData});
        if (isValid === false) {
            return;
        }
        this.datasource.execute(DataSource.Operation.DOWNLOAD, requestData);
    }

    private _redraw(forceRender) {
        if (forceRender) {
            this.datagridElement.datatable(this.gridOptions);
        } else {
            setTimeout(function () {
                this.callDataGridMethod('setColGroupWidths');
                this.callDataGridMethod('addOrRemoveScroll');
            });
        }
    }

    callEvent(event) {
        // TODO: Change logic to handle all scenarios
        if (event) {
            this[event.substring(0, event.indexOf('('))]();
        }
    }
}
