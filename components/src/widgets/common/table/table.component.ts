import { AfterContentInit, Attribute, Component, ContentChildren, ElementRef, HostListener, Injector, NgZone, OnDestroy, QueryList, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, ControlValueAccessor } from '@angular/forms';

import { Subject } from 'rxjs/Subject';

import { $appDigest, $parseEvent, $unwatch, $watch, App, DataSource, getClonedObject, getValidJSON, isDataSourceEqual, isDefined, isMobile, triggerFn } from '@wm/core';

import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { registerProps } from './table.props';
import { EDIT_MODE, getRowOperationsColumn } from '../../../utils/live-utils';
import { transformData } from '../../../utils/data-utils';
import { getConditionalClasses, getOrderByExpr, prepareFieldDefs, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';

declare const _;
declare var $: any;

registerProps();

const DEFAULT_CLS = 'app-grid app-panel panel';
const WIDGET_CONFIG = {widgetType: 'wm-table', hostClass: DEFAULT_CLS};

const exportIconMapping = {
    EXCEL: 'fa fa-file-excel-o',
    CSV: 'fa fa-file-text-o'
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
        provideAsNgValueAccessor(TableComponent),
        provideAsWidgetRef(TableComponent)
    ]
})
export class TableComponent extends StylableComponent implements AfterContentInit, OnDestroy, ControlValueAccessor {

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
        data: [],
        colDefs: [],
        startRowIndex: 1,
        sortInfo: {
            field: '',
            direction: ''
        },
        filtermode: '',
        rowActions: [],
        headerConfig: [],
        rowClass: '',
        editmode: '',
        formPosition: '',
        isMobile: false,
        dateFormat: '',
        timeFormat: '',
        name: '',
        messages: {
            selectField: 'Select Field'
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
        onRowSelect: (row, e) => {
            this.selectedItems = this.callDataGridMethod('getSelectedRows');
            this.selectedItemChange.next(this.selectedItems);

            /*
             * in case of single select, update the items with out changing the reference.
             * for multi select, keep old selected items in tact
             */
            if (this.multiselect) {
                if (_.findIndex(this.items, row) === -1) {
                    this.items.push(row);
                }
            } else {
                this.items.length = 0;
                this.items.push(row);
            }
            this.invokeEventCallback('select', {$data: row, $event: e, row});
            this.invokeEventCallback('rowclick', {$data: row, $event: e, row});
            $appDigest();
        },
        onRowDblClick: (row, e) => {
            this.invokeEventCallback('rowdblclick', {$data: row, $event: e, row});
        },
        onRowDeselect: (row, e) => {
            if (this.multiselect) {
                this.items = _.pullAllWith(this.items, [row], _.isEqual);
                this.selectedItems = this.callDataGridMethod('getSelectedRows');
                this.invokeEventCallback('deselect', {$data: row, $event: e, row});
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
        onRowDelete: (row, cancelRowDeleteCallback, e, callBack) => {
            this.ngZone.run(() => {
                this.deleteRecord(row, cancelRowDeleteCallback, e, callBack);
            });
        },
        onRowInsert: (row, e, callBack) => {
            this.insertRecord({row, event: e, 'callBack': callBack});
        },
        beforeRowUpdate: (row, eventName?) => {
            if (this._liveTableParent) {
                this._liveTableParent.updateRow(row, eventName);
            }
            this.prevData = getClonedObject(row);
        },
        afterRowUpdate: (row, e, callBack) => {
            this.updateRecord({row, 'prevData': this.prevData, 'event': e, 'callBack': callBack});
        },
        onBeforeRowUpdate: (row, e) => {
            return this.invokeEventCallback('beforerowupdate', {$event: e, $data: row, row});
        },
        onBeforeRowInsert: (row, e) => {
            return this.invokeEventCallback('beforerowinsert', {$event: e, $data: row, row});
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
        onBeforeFormRender: (row, e, operation) => {
            return this.invokeEventCallback('beforeformrender', {$event: e, row, $operation: operation});
        },
        clearCustomExpression: () => {
            this.customExprViewRef.clear();
        },
        registerRowNgClassWatcher: (rowData, index) => {
            if (!this.rowngclass) {
                return;
            }
            const row = this.getClonedRowObject(rowData);
            const watchName = `${this.name}_rowNgClass_${index}`;
            $unwatch(watchName);
            this.registerDestroyListener($watch(this.rowngclass, this.viewParent, {row}, (nv, ov) => {
                this.callDataGridMethod('applyRowNgClass', getConditionalClasses(nv, ov), index);
            }, watchName));
        },
        registerColNgClassWatcher: (rowData, colDef, rowIndex, colIndex) => {
            if (!colDef['col-ng-class']) {
                return;
            }
            const row = this.getClonedRowObject(rowData);
            const watchName = `${this.name}_colNgClass_${rowIndex}_${colIndex}`;
            $unwatch(watchName);
            this.registerDestroyListener($watch(colDef['col-ng-class'], this.viewParent, {row}, (nv, ov) => {
                this.callDataGridMethod('applyColNgClass', getConditionalClasses(nv, ov), rowIndex, colIndex);
            }, watchName));
        },
        generateCustomExpressions: (rowData, index) => {
            const row = this.getClonedRowObject(rowData);
            this.customExprCompiledTl[index] = [];
            // For all the columns inside the table, generate the inline widget
            this.customExprTmpl.forEach(tmpl => {
                const customExprView = this.customExprViewRef.createEmbeddedView(tmpl, {
                    row,
                    colDef: {},
                    columnValue: ''
                });
                const rootNode = customExprView.rootNodes[0];
                const fieldName = rootNode.getAttribute('data-col-identifier');
                customExprView.context.colDef = this.columns[fieldName];
                customExprView.context.columnValue = row.getProperty(fieldName);
                this.customExprCompiledTl[fieldName + index] = rootNode;
            });
        },
        getCustomExpression: (fieldName, index) => {
            return this.customExprCompiledTl[fieldName + index];
        },
        clearRowActions: () => {
            this.rowActionsViewRef.clear();
        },
        generateRowActions: (rowData, index) => {
            const row = this.getClonedRowObject(rowData);
            this.rowActionsCompiledTl[index] = [];
            // For all the columns inside the table, generate the inline widget
            this.rowActionTmpl.forEach((tmpl) => {
                this.rowActionsCompiledTl[index].push(...this.rowActionsViewRef.createEmbeddedView(tmpl, {row}).rootNodes);
            });
        },
        getRowAction: (index) => {
            return this.rowActionsCompiledTl[index];
        },
        generateInlineEditRow: (rowData, alwaysNewRow) => {
            const row = this.getClonedRowObject(rowData);
            if (alwaysNewRow) {
                // Clear the view container ref
                this.inlineEditNewViewRef.clear();
                this.inlineNewCompliedTl = {};
                // For all the columns inside the table, generate the inline widget
                this.inlineWidgetNewTmpl.forEach(tmpl => {
                    const rootNode = this.inlineEditNewViewRef.createEmbeddedView(tmpl, {row}).rootNodes[0];
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
                const rootNode = this.inlineEditViewRef.createEmbeddedView(tmpl, {row}).rootNodes[0];
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

        this._onChange(newValue);
        this._onTouched();

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

        // Show loading status based on the variable life cycle
        this.app.subscribe('toggle-variable-state', this.handleLoading.bind(this));
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
        const runModeInitialProperties = {
            showrowindex: 'showRowIndex',
            multiselect: 'multiselect',
            radioselect: 'showRadioColumn',
            filternullrecords: 'filterNullRecords',
            enablesort: 'enableSort',
            showheader: 'showHeader',
            enablecolumnselection: 'enableColumnSelection',
            shownewrow: 'showNewRow',
            gridfirstrowselect: 'selectFirstRow'
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
        this.gridOptions.rowClass = this.rowclass;
        this.gridOptions.editmode = this.editmode;
        this.gridOptions.formPosition = this.formposition;
        this.gridOptions.filtermode = this.filtermode;
        this.gridOptions.isMobile = isMobile();
        // TODO: App defaults
        this.gridOptions.name = this.name;
        this.gridOptions.messages = {
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
        return this.datasource ? this.datasource.execute(operation, options) : {};
    }

    getClonedRowObject(rowData) {
        const row = getClonedObject(rowData);
        row.getProperty = field => {
            return _.get(row, field);
        };
        row.$index = rowData.$$index - 1;
        row.$isFirst = row.$index === 0;
        row.$isLast = this.gridData.length === row.$index + 1;
        return row;
    }

    handleLoading(data) {
        const dataSource = this.datasource;
        // based on the active state and response toggling the 'loading data...' and 'no data found' messages.
        if (dataSource && dataSource.execute(DataSource.Operation.IS_API_AWARE) && isDataSourceEqual(data.variable, dataSource)) {
            this.variableInflight = data.active;
            if (data.active) {
                this.callDataGridMethod('setStatus', 'loading', this.loadingdatamsg);
            } else {
                // If grid is in edit mode or grid has data, dont show the no data message
                if (!this.isGridEditMode && _.isEmpty(this.dataset)) {
                    this.callDataGridMethod('setStatus', 'nodata', this.nodatamessage);
                } else {
                    this.callDataGridMethod('setStatus', 'ready');
                }
            }
        }
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
            isDisplayed = (this.fieldDefs.length && isDefined(this.fieldDefs[index]) &&
                (isMobile() ? this.fieldDefs[index].mobileDisplay : this.fieldDefs[index].pcDisplay)) || true;
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

    renderOperationColumns() {
        let rowActionCol,
            insertPosition;

        const rowOperationsColumn = getRowOperationsColumn(),
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
                this.dataNavigator.options = {
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
        // If fielddefs are not present, generate fielddefs from data
        if (this.fieldDefs.length) {
            this.setGridData(this.serverData);
        } else {
            this.createGridColumns(this.serverData);
        }
    }

    prepareFieldDefs(data) {
        let defaultFieldDefs;
        let properties;

        this.fieldDefs = [];
        this.headerConfig = [];
        /* if properties map is existed then fetch the column configuration for all nested levels using util function */
        properties = data;
        /*call utility function to prepare fieldDefs for grid against given data (A MAX OF 10 COLUMNS ONLY)*/
        defaultFieldDefs = prepareFieldDefs(properties);

        /*append additional properties*/
        _.forEach(defaultFieldDefs, columnDef => {
            columnDef.pcDisplay = true;
            columnDef.mobileDisplay = true;
            columnDef.searchable = true;
            columnDef.type  = 'string';
            this.headerConfig.push({
                'name'  : columnDef.field,
                'field' : columnDef.field
            });
        });

        /*prepare a copy of fieldDefs prepared
         (defaultFieldDefs will be passed to markup and fieldDefs are used for grid)
         (a copy is kept to prevent changes made by ng-grid in the fieldDefs)
         */
        this.fieldDefs = getClonedObject(defaultFieldDefs);

        this.renderOperationColumns();
        this.setDataGridOption('colDefs', this.fieldDefs);
    }

    createGridColumns(data) {
        /* this call back function receives the data from the variable */
        /* check whether data is valid or not */
        const dataValid = data && !data.error;
        /*if the data is type json object, make it an array of the object*/
        if (dataValid && !_.isArray(data)) {
            data = [data];
        }
        /* if new columns to be rendered, prepare default fieldDefs for the data provided*/
        this.prepareFieldDefs(data);
        /* Arranging Data for Pagination */
        /* if data exists and data is not error type the render the data on grid using setGridData function */
        if (dataValid) {
            /*check for nested data if existed*/
            this.serverData = data;
            this.setGridData(this.serverData);
        }
    }

    getSortExpr() {
        let sortExp;
        let pagingOptions;
        if (this.datasource && this.datasource.execute(DataSource.Operation.IS_PAGEABLE)) {
            pagingOptions = this.datasource.execute(DataSource.Operation.GET_PAGING_OPTIONS);
            sortExp = _.isEmpty(pagingOptions) ? '' : getOrderByExpr(pagingOptions.sort);
        }
        return sortExp || '';
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
            if (!this.variableInflight) {
                this.callDataGridMethod('setStatus', 'nodata', this.nodatamessage);
            }
            this.setDataGridOption('selectFirstRow', this.gridfirstrowselect);
        }

        if (!this.shownavigation && newVal) {
            this.checkFiltersApplied(this.getSortExpr());
        }

        // TODO: Handle selected item reference data

        if (!_.isObject(newVal) || newVal === '' || (newVal && newVal.dataValue === '')) {
            if (!this.variableInflight) {
                // If variable has finished loading and resultSet is empty, ender empty data
                this.setGridData([]);
            }
            return;
        }
        if (newVal) {
            this.populateGridData(newVal);
        }
    }

    onDataSourceChange() {
        this.fieldDefs.forEach(col => {
           triggerFn(col.onDataSourceChange && col.onDataSourceChange.bind(col));
        });
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
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
                this.watchVariableDataSet(nv);
                break;
            case 'gridclass':
                this.callDataGridMethod('option', 'cssClassNames.grid', nv);
                break;
            case 'filtermode':
                this.setDataGridOption('filtermode', nv);
                break;
            case 'searchlabel':
                this.setDataGridOption('searchLabel', nv);
                break;
            case 'navigation':
                if (nv === 'Advanced') { // Support for older projects where navigation type was advanced instead of clasic
                    this.navigation = 'Classic';
                    return;
                }
                if (nv !== 'None') {
                    this.shownavigation = true;
                }
                this.navControls = nv;
                break;
            case 'gridfirstrowselect':
                this.setDataGridOption('selectFirstRow', nv);
                break;
            case 'gridclass':
                this.callDataGridMethod('option', 'cssClassNames.grid', nv);
                break;
            case 'nodatamessage':
                this.callDataGridMethod('option', 'dataStates.nodata', nv);
                break;
            case 'loadingdatamsg':
                this.callDataGridMethod('option', 'dataStates.loading', nv);
                break;
            case 'loadingicon':
                this.callDataGridMethod('option', 'loadingicon', nv);
                break;
            case 'spacing':
                this.callDataGridMethod('option', 'spacing', nv);
                if (nv === 'condensed') {
                    this.navigationSize = 'small';
                } else {
                    this.navigationSize = '';
                }
                break;
            case 'exportformat':
                this.exportOptions = [];
                if (nv) {
                    // Populate options for export drop down menu
                    _.forEach(_.split(nv, ','), type => {
                        this.exportOptions.push({
                            label: type,
                            icon: exportIconMapping[type]
                        });
                    });
                }
                break;
            case 'shownewrow':
                // Enable new row if shownew is true or addNewRow buton is present
                enableNewRow = nv || _.some(this.actions, act => _.includes(act.action, 'addNewRow()'));
                this.callDataGridMethod('option', 'actionsEnabled.new', enableNewRow);
                break;
            case 'show':
                if (nv) {
                    this.invokeEventCallback('show');
                } else {
                    this.invokeEventCallback('hide');
                }
            default:
                super.onPropertyChange(key, nv, ov);
        }
    }

    onStyleChange(key, nv, ov) {
        switch (key) {
            case 'width':
                this.callDataGridMethod('setGridDimensions', 'width', nv);
                break;
            case 'height':
                this.callDataGridMethod('setGridDimensions', 'height', nv);
                break;
        }

        super.onStyleChange(key, nv, ov);
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
        if (isMobile()) {
            if (!tableColumn.mobileDisplay) {
                return;
            }
        } else {
            if (!tableColumn.pcDisplay) {
                return;
            }
        }
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
        let data;
        this.__fullData = nv;
        this.checkFiltersApplied(this.getSortExpr());
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

    toggleMessage(show, type, msg, header?) {
        if (show && msg) {
            this.app.notifyApp(msg, type, header);
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
            matchMode : 'anywhereignorecase',
            filterFields : filterFields,
            orderBy : sortOptions,
            exportType : $item.label,
            logicalOp : 'AND',
            exportSize : this.exportdatasize,
            columns : columns
        };
        isValid = this.invokeEventCallback('beforeexport', {$data: requestData});
        if (isValid === false) {
            return;
        }
        requestData.fields = _.values(requestData.columns);
        this.datasource.execute(DataSource.Operation.DOWNLOAD, {data: requestData});
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

    registerFormWidget() {}

    // Form control accessor methods. This will be used for table inside form
    writeValue() {}

    private _onChange: any = () => {};
    private _onTouched: any = () => {};

    registerOnChange(fn) {
        this._onChange = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
}
