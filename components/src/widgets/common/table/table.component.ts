import { AfterContentInit, Attribute, Component, ElementRef, Injector, OnDestroy, ViewChild, ViewContainerRef, ContentChildren, QueryList, HostListener, NgZone } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { $appDigest, DataSource, getClonedObject, getValidJSON, isDefined, App, isPageable, triggerFn, $parseEvent } from '@wm/core';

import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { registerProps } from './table.props';
import { getRowOperationsColumn, EDIT_MODE } from '../../../utils/live-utils';
import { transformData } from '../../../utils/data-utils';
import { getOrderByExpr, provideAsWidgetRef } from '../../../utils/widget-utils';
import { FormGroup, FormBuilder } from '@angular/forms';

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

const isInputBodyWrapper = target => {
    const classes = ['.dropdown-menu', '.uib-typeahead-match', '.modal-dialog', '.toast'];
    let isInput = false;
    classes.forEach(cls => {
        if (target.closest(cls).length) {
            isInput = true;
            return false;
        }
    });
    return isInput;
};

@Component({
    selector: '[wmTable]',
    templateUrl: './table.component.html',
    providers: [
        provideAsWidgetRef(TableComponent)
    ]
})
export class TableComponent extends StylableComponent implements AfterContentInit, OnDestroy {

    @ViewChild(PaginationComponent) dataNavigator;

    @ViewChild('datagridElement') private _tableElement: ElementRef;

    @ContentChildren('rowActionTmpl') rowActionTmpl: QueryList<any>;
    @ViewChild('rowActionsView', {read: ViewContainerRef}) rowActionsViewRef: ViewContainerRef;

    @ContentChildren('filterTmpl', {descendants: true}) filterTmpl: QueryList<any>;
    @ViewChild('multiColumnFilterView', {read: ViewContainerRef}) filterViewRef: ViewContainerRef;

    @ContentChildren('inlineWidgetTmpl', {descendants: true}) inlineWidgetTmpl: QueryList<any>;
    @ViewChild('inlineEditView', {read: ViewContainerRef}) inlineEditViewRef: ViewContainerRef;

    @ContentChildren('inlineWidgetTmplNew', {descendants: true}) inlineWidgetNewTmpl: QueryList<any>;
    @ViewChild('inlineEditNewView', {read: ViewContainerRef}) inlineEditNewViewRef: ViewContainerRef;

    @ContentChildren('customExprTmpl', {descendants: true}) customExprTmpl: QueryList<any>;
    @ViewChild('customExprView', {read: ViewContainerRef}) customExprViewRef: ViewContainerRef;

    private rowActionsCompiledTl: any  = {};
    private rowFilterCompliedTl: any = {};
    private inlineCompliedTl: any = {};
    private inlineNewCompliedTl: any = {};
    private customExprCompiledTl: any = {};

    columns = {};
    formfields = {};
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
    shownewrow;

    selectedItemChange = new Subject();
    selectedItemChange$ = this.selectedItemChange.asObservable();

    actions = [];
    _actions = {
        'header': [],
        'footer': []
    };
    exportOptions = [];
    exportdatasize;
    formWidgets;
    headerConfig = [];
    items = [];
    navControls;
    rowActions = [];
    selectedColumns;
    shownavigation = false;
    dataset;
    _liveTableParent;
    isPartOfLiveGrid;
    gridElement;
    isMobile;
    isLoading;
    documentClickBind = noop;

    fieldDefs = [];
    private fullFieldDefs = [];
    private __fullData;
    private dataNavigatorWatched;
    private navigatorResultWatch;
    private navigatorMaxResultWatch;
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
    getNavigationTargetBySortInfo: Function;
    refreshData: Function;

    // Inline Edit
    ngform: FormGroup;
    updateVariable: Function;
    updateRecord: Function;
    deleteRecord: Function;
    insertRecord: Function;
    editRow: Function;
    addNewRow: Function;
    deleteRow: Function;
    onRecordDelete: Function;
    initiateSelectItem: Function;
    hideEditRow: Function;
    saveRow: Function;
    cancelRow: Function;

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
            this.invokeEventCallback('select', {$data: rowData, $event: e, $rowData: rowData});
            this.invokeEventCallback('rowclick', {$data: rowData, $event: e, $rowData: rowData});
            $appDigest();
        },
        onRowDblClick: (rowData, e) => {
            this.invokeEventCallback('rowdblclick', {$data: rowData, $event: e, $rowData: rowData});
        },
        onRowDeselect: (rowData, e) => {
            if (this.multiselect) {
                this.items = _.pullAllWith(this.items, [rowData], _.isEqual);
                this.selectedItems = this.callDataGridMethod('getSelectedRows');
                this.invokeEventCallback('deselect', {$data: rowData, $event: e, $rowData: rowData});
            }
            $appDigest();
        },
        onColumnSelect: (col, e) => {
            this.selectedColumns = this.callDataGridMethod('getSelectedColumns');
            this.invokeEventCallback('columnselect', {$data: col, $event: e});
        },
        onColumnDeselect: (col, e) => {
            this.selectedColumns = this.callDataGridMethod('getSelectedColumns');
            this.invokeEventCallback('columndeselect', {$data: col, $event: e});
        },
        onHeaderClick: (col, e) => {
            // if onSort function is registered invoke it when the column header is clicked
            this.invokeEventCallback('headerclick', {$event: e, $data: col});
        },
        onRowDelete: (rowData, cancelRowDeleteCallback, e, callBack) => {
            this.ngZone.run(() => {
                this.deleteRecord(rowData, cancelRowDeleteCallback, e, callBack);
            });
        },
        onRowInsert: (rowData, e, callBack) => {
            this.insertRecord({'row': rowData, event: e, 'callBack': callBack});
        },
        beforeRowUpdate: (rowData, eventName?) => {
            if (this._liveTableParent) {
                this._liveTableParent.updateRow(rowData, eventName);
            }
            this.prevData = getClonedObject(rowData);
        },
        afterRowUpdate: (rowData, e, callBack) => {
            this.updateRecord({'row': rowData, 'prevData': this.prevData, 'event': e, 'callBack': callBack});
        },
        onBeforeRowUpdate: (rowData, e) => {
            return this.invokeEventCallback('beforerowupdate', {$event: e, $data: rowData, $rowData: rowData});
        },
        onBeforeRowInsert: (rowData, e) => {
            return this.invokeEventCallback('beforerowinsert', {$event: e, $data: rowData, $rowData: rowData});
        },
        onFormRender: ($row, e, operation, alwaysNewRow) => {
            const widget = alwaysNewRow ? 'inlineWidgetNew' : 'inlineWidget';
            setTimeout(() => {
                this.formWidgets = {};
                this.fieldDefs.forEach(col => {
                    if (col[widget]) {
                        this.formWidgets[col.field] = col[widget];
                    }
                });
                this.invokeEventCallback('formrender', {$event: e, formWidgets: this.formWidgets, $operation: operation});
            }, 250);
        },
        onBeforeFormRender: (rowData, e, operation) => {
            return this.invokeEventCallback('beforeformrender', {$event: e, $rowData: rowData, $operation: operation});
        },
        clearCustomExpression: () => {
            this.customExprViewRef.clear();
        },
        generateCustomExpressions: (index, row) => {
            const rowData = getClonedObject(row);
            rowData.getProperty = field => {
                return _.get(row, field);
            };
            this.customExprCompiledTl[index] = [];
            // For all the columns inside the table, generate the inline widget
            this.customExprTmpl.forEach(tmpl => {
                const customExprView = this.customExprViewRef.createEmbeddedView(tmpl, {
                    row: rowData,
                    selectedItemData: row
                });
                const rootNode = customExprView.rootNodes[0];
                const fieldName = rootNode.getAttribute('data-col-identifier');
                this.customExprCompiledTl[fieldName + index] = rootNode;
            });
        },
        getCustomExpression: (fieldName, index) => {
            return this.customExprCompiledTl[fieldName + index];
        },
        clearRowActions: () => {
            this.rowActionsViewRef.clear();
        },
        generateRowActions: (index, row) => {
            this.rowActionsCompiledTl[index] = [];
            // For all the columns inside the table, generate the inline widget
            this.rowActionTmpl.forEach((tmpl) => {
                this.rowActionsCompiledTl[index].push(...this.rowActionsViewRef.createEmbeddedView(tmpl, {
                    row: row,
                    $rowData: row
                }).rootNodes);
            });
        },
        getRowAction: (index) => {
            return this.rowActionsCompiledTl[index];
        },
        generateInlineEditRow: (alwaysNewRow, row) => {
            if (alwaysNewRow) {
                // Clear the view container ref
                this.inlineEditNewViewRef.clear();
                this.inlineNewCompliedTl = {};
                // For all the columns inside the table, generate the inline widget
                this.inlineWidgetNewTmpl.forEach(tmpl => {
                    const rootNode = this.inlineEditNewViewRef.createEmbeddedView(tmpl, {
                        row: row,
                        rowData: row
                    }).rootNodes[0];
                    this.inlineNewCompliedTl[rootNode.getAttribute('data-col-identifier')] = rootNode;
                });
                this.clearForm(true);
                return;
            }
            // Clear the view container ref
            this.inlineEditViewRef.clear();
            this.inlineCompliedTl = {};
            this.clearForm();
            // For all the columns inside the table, generate the inline widget
            this.inlineWidgetTmpl.forEach(tmpl => {
                const rootNode = this.inlineEditViewRef.createEmbeddedView(tmpl, {
                    row: row,
                    rowData: row
                }).rootNodes[0];
                this.inlineCompliedTl[rootNode.getAttribute('data-col-identifier')] = rootNode;
            });
        },
        getInlineEditWidget: (fieldName, value, alwaysNewRow) => {
            if (alwaysNewRow) {
                this.gridOptions.setFieldValue(fieldName + '_new', value);
                return this.inlineNewCompliedTl[fieldName];
            }
            this.gridOptions.setFieldValue(fieldName, value);
            return this.inlineCompliedTl[fieldName];
        },
        setFieldValue: (fieldName, value) => {
            const control = this.ngform.controls && this.ngform.controls[fieldName];
            if (control) {
                control.setValue(value);
            }
        },
        getFieldValue: fieldName => {
            const control = this.ngform.controls && this.ngform.controls[fieldName];
            return control && control.value;
        },
        generateFilterRow: () => {
            // Clear the view container ref
            this.filterViewRef.clear();
            this.rowFilterCompliedTl = {};
            // For all the columns inside the table, generate the compiled filter template
            this.filterTmpl.forEach((tmpl) => {
                const rootNode = this.filterViewRef.createEmbeddedView(tmpl, {
                    changeFn: this.onRowFilterChange.bind(this),
                    isDisabled: (fieldName) => {
                        return this.emptyMatchModes.indexOf(this.rowFilter[fieldName] && this.rowFilter[fieldName].matchMode) > -1;
                    }
                }).rootNodes[0];
                this.rowFilterCompliedTl[rootNode.getAttribute('data-col-identifier')] = rootNode;
            });
        },
        getFilterWidget: (fieldName) => {
            // Move the generated filter template to the filter row
            return this.rowFilterCompliedTl[fieldName];
        },
        setGridEditMode: (val) => {
            this.isGridEditMode = val;
            $appDigest();
        },
        setGridState: (val) => {
            this.isLoading = val === 'loading';
        },
        noChangesDetected: () => {
            this.toggleMessage(true, 'info', 'No Changes Detected');
        },
        // Function to redraw the widgets on resize of columns
        redrawWidgets: () => {
            this.fieldDefs.forEach(col => {
                triggerFn(col.inlineWidget && col.inlineWidget.redraw);
                triggerFn(col.inlineWidgetNew && col.inlineWidgetNew.redraw);
                triggerFn(col.filterWidget && col.filterWidget.redraw);
            });
        },
        searchHandler: this.searchSortHandler.bind(this),
        sortHandler: this.searchSortHandler.bind(this),
        timeoutCall: (fn, delay) => {
            setTimeout(fn, delay);
        },
        safeApply: () => {
            $appDigest();
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

    @HostListener('keypress', ['$event']) onKeyPress ($event: any) {
        if ($event.which === 13) {
            this.invokeEventCallback('enterkeypress', {$event, $data: this.gridData});
        }
    }

    constructor(
        inj: Injector,
        public fb: FormBuilder,
        private app: App,
        @Attribute('dataset.bind') public binddataset,
        @Attribute('readonlygrid') public readonlygrid,
        private ngZone: NgZone
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);

        this.ngform = fb.group({});
        this.addEventsToContext(this.context);
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

        if (this._liveTableParent) {
            this.isPartOfLiveGrid = true;
        }

        if (this.readonlygrid || !this.editmode) {
            if (this.readonlygrid === 'true') {
                this.editmode = '';
            } else {
                if (this.isPartOfLiveGrid) {
                    this.editmode = this.isPartOfLiveGrid.formlayout === 'inline' ? EDIT_MODE.FORM : EDIT_MODE.DIALOG;
                } else {
                    this.editmode = this.readonlygrid ? EDIT_MODE.INLINE : '';
                }
            }
        }

        this.gridOptions.colDefs = this.fullFieldDefs;
        this.gridOptions.rowActions = this.rowActions;
        this.gridOptions.headerConfig = this.headerConfig;
        this.gridOptions.rowNgClass = this.rowngclass;
        this.gridOptions.rowClass = this.rowclass;
        this.gridOptions.editmode = this.editmode;
        this.gridOptions.formPosition = this.formposition;
        this.gridOptions.filtermode = this.filtermode;
        // TODO: this.gridOptions.isMobile   = isMobile();
        // TODO: App defaults
        this.gridOptions.name = this.name;
        this.gridOptions.messages       = {
            'selectField': 'Select Field'
        };
        this.datagridElement = $(this._tableElement.nativeElement);

        this.gridElement = this.$element;
        this.$element.css({'position': 'relative'});

        _.forEach(runModeInitialProperties, (value, key) => {
            if (isDefined(this[key])) {
                this.gridOptions[value] = (this[key] === 'true' || this[key] === true);
            }
        });

        this.renderOperationColumns();
        this.gridOptions.colDefs = this.fieldDefs;

        this.datagridElement.datatable(this.gridOptions);
        this.callDataGridMethod('setStatus', 'loading', this.loadingdatamsg);

        this.watchVariableDataSet(this.dataset);

        this.applyProps.forEach(args => this.callDataGridMethod(...args));

        if (this.editmode === EDIT_MODE.QUICK_EDIT) {
            this.documentClickBind = this._documentClickBind.bind(this);
            document.addEventListener('click', this.documentClickBind);
        }
    }

    ngOnDestroy() {
        document.removeEventListener('click', this.documentClickBind);
        if (this.navigatorResultWatch) {
            this.navigatorResultWatch.unsubscribe();
        }
        if (this.navigatorMaxResultWatch) {
            this.navigatorMaxResultWatch.unsubscribe();
        }
        super.ngOnDestroy();
    }

    addEventsToContext(context) {
        context.addNewRow = () => this.addNewRow();
        context.deleteRow = () => this.deleteRow();
        context.editRow = () => this.editRow();
    }

    execute(operation, options) {
        if ([DataSource.Operation.IS_API_AWARE, DataSource.Operation.IS_PAGEABLE, DataSource.Operation.SUPPORTS_SERVER_FILTER].includes(operation)) {
            return false;
        }
        return this.datasource.execute(operation, options);
    }

    clearForm(newRow?) {
        const ctrls = this.ngform.controls;
        _.keys(this.ngform.controls).forEach(key => {
            if (newRow) {
                if (key.endsWith('_new')) {
                    ctrls[key].setValue('');
                }
                return;
            }
            ctrls[key].setValue('');
        });
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
           triggerFn(col.onDataSourceChange && col.onDataSourceChange.bind(col));
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
            case 'navigation':
                if (newVal === 'Advanced') { // Support for older projects where navigation type was advanced instead of clasic
                    this.navigation = 'Classic';
                    return;
                }
                if (newVal !== 'None') {
                    this.shownavigation = true;
                }
                this.navControls = newVal;
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
        this.fieldDefs.forEach(col => {
            this.columns[col.field] = col;
        });
    }

    registerFormField(name, formField) {
        this.formfields[name] = formField;
    }

    registerActions(tableAction) {
        this.actions.push(tableAction);
        this.populateActions();
    }

    registerRowActions(tableRowAction) {
        this.rowActions.push(tableRowAction);
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

    toggleMessage(show, type, msg) {
        if (show && msg) {
            this.app.Actions.appNotification.invoke({
                message: msg,
                class: type
            });
        }
    }

    export($item) {
        let filterFields;
        const sortOptions = _.isEmpty(this.sortInfo) ? '' : this.sortInfo.field + ' ' + this.sortInfo.direction;
        const columns = {};
        let isValid;
        let requestData;
        this.fieldDefs.forEach(fieldDef => {
            // Do not add the row operation actions column to the exported file.
            if (fieldDef.field === ROW_OPS_FIELD || !fieldDef.show) {
                return;
            }
            const option = {
                'header': fieldDef.displayName
            };
            // If column has exportexpression, then send form the expression as required by backend.
            // otherwise send the field name.
            if (fieldDef.exportexpression) {
                (<any>option).expression = fieldDef.exportexpression;
            } else {
                (<any>option).field = fieldDef.field;
            }
            columns[fieldDef.field] = option;
        });
        filterFields = this.getFilterFields(this.filterInfo);
        requestData = {
            matchMode : 'anywhere',
            filterFields : filterFields,
            orderBy : sortOptions,
            exportType : $item.label,
            logicalOp : 'AND',
            size : this.exportdatasize,
            columns : columns
        };
        isValid = this.invokeEventCallback('beforeexport', {$data: requestData});
        if (isValid === false) {
            return;
        }
        requestData.fields = _.values(requestData.columns);
        this.datasource.execute(DataSource.Operation.DOWNLOAD, requestData);
    }

    private _documentClickBind(event) {
        const $target = event.target;
        // If click triggered from same grid or a dialog, do not save the row
        if (this.$element[0].contains($target) || event.target.doctype || isInputBodyWrapper($($target))) {
            return;
        }
        this.callDataGridMethod('saveRow');
    }

    private _redraw(forceRender) {
        if (forceRender) {
            this.datagridElement.datatable(this.gridOptions);
        } else {
            setTimeout(() => {
                this.callDataGridMethod('setColGroupWidths');
                this.callDataGridMethod('addOrRemoveScroll');
            });
        }
    }

    invokeActionEvent($event, expression: string) {
        const fn = $parseEvent(expression);
        fn(this.viewParent, Object.assign(this.context, {$event}));
    }
}
