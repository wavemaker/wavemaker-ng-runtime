import { AfterContentInit, Attribute, Component, ContentChildren, ContentChild, ElementRef, HostListener, Injector, NgZone, OnDestroy, Optional, QueryList, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Observable, Subject } from 'rxjs';

import {
    $appDigest,
    $parseEvent,
    $unwatch,
    $watch,
    App,
    closePopover,
    DataSource,
    getClonedObject,
    getDatasourceFromExpr,
    getValidJSON,
    IDGenerator,
    isDataSourceEqual,
    isDefined,
    isMobile,
    triggerFn,
    DynamicComponentRefProvider,
    extendProto,
    $invokeWatchers
} from '@wm/core';
import { EDIT_MODE, getConditionalClasses, getOrderByExpr, getRowOperationsColumn, prepareFieldDefs, provideAs, provideAsWidgetRef, StylableComponent, styler, transformData } from '@wm/components/base';
import { PaginationComponent } from '@wm/components/data/pagination';

import { ListComponent } from '@wm/components/data/list';
import { registerProps } from './table.props';
import {debounceTime} from "rxjs/operators";

declare const _, $;

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
    const attrs = ['bsdatepickerdaydecorator'];
    if (!isInput) {
        attrs.forEach(attr => {
            if (target[0].hasAttribute(attr)) {
                isInput = true;
                return false;
            }
        });
    }
    return isInput;
};

@Component({
    selector: '[wmTable]',
    templateUrl: './table.component.html',
    providers: [
        provideAs(TableComponent, NG_VALUE_ACCESSOR, true),
        provideAsWidgetRef(TableComponent)
    ]
})
export class TableComponent extends StylableComponent implements AfterContentInit, OnDestroy, ControlValueAccessor {
    static initializeProps = registerProps();
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

    @ContentChildren('rowExpansionActionTmpl') rowExpansionActionTmpl: QueryList<any>;
    @ContentChild('rowExpansionTmpl') rowExpansionTmpl: TemplateRef<any>;
    @ViewChild('rowDetailView', {read: ViewContainerRef}) rowDetailViewRef: ViewContainerRef;
    @ViewChild('rowExpansionActionView', {read: ViewContainerRef}) rowExpansionActionViewRef: ViewContainerRef;

    @ViewChild('dynamicTable', {read: ViewContainerRef}) dynamicTableRef: ViewContainerRef;

    private rowActionsCompiledTl: any  = {};
    private rowFilterCompliedTl: any = {};
    private inlineCompliedTl: any = {};
    private inlineNewCompliedTl: any = {};
    private customExprCompiledTl: any = {};
    private customExprCompiledSummaryTl: any = {};
    private rowDefInstances = {};
    private rowDefMap = {};
    private rowExpansionActionTl: any = {};

    columns = {};
    formfields = {};
    datagridElement;
    datasource;
    editmode;
    enablecolumnselection;
    enablesort = true;
    filtermode;
    searchlabel;
    formposition;
    gridclass;
    gridfirstrowselect;
    iconclass;
    isGridEditMode;
    loadingdatamsg;
    multiselect;
    name;
    _isDependent;
    navigation;
    navigationSize;
    navigationalign;
    nodatamessage;
    pagesize;
    prevData;
    primaryKey = [];
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
    deleteoktext;
    deletecanceltext;
    onError;
    onRowinsert;
    onRowupdate;
    onRowdelete;
    selectedItemChange = new Subject();
    selectedItemChange$: Observable<any> = this.selectedItemChange.asObservable();

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
    rowDef: any = {};
    rowInstance: any = {};

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
    private isdynamictable;
    private _dynamicContext;
    private noOfColumns;

    private applyProps = new Map();

    redraw = _.debounce(this._redraw, 150);
    debouncedHandleLoading = _.debounce(this.handleLoading, 350);

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
    adjustContainer = noop;
    getNavigationTargetBySortInfo: Function;
    refreshData: Function;
    clearFilter: Function;

    // Inline Edit
    ngform: FormGroup;
    updateVariable: Function;
    updateRecord: Function;
    deleteRecord: Function;
    insertRecord: Function;
    editRow: Function;
    addNewRow: Function;
    addRow: Function;
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
        searchLabel: '',
        rowActions: [],
        headerConfig: [],
        rowClass: '',
        editmode: '',
        formPosition: '',
        isMobile: false,
        rowExpansionEnabled: false,
        rowDef: {
            position: '0'
        },
        name: '',
        messages: {
            selectField: 'Select Field'
        },
        onDataRender: () => {
            this.ngZone.run(() => {
                if (this.gridData.length) {
                    this.invokeEventCallback('datarender', {$data: this.gridData, data: this.gridData});
                }
                // select rows selected in previous pages. (Not finding intersection of data and selecteditems as it will be heavy)
                if (!this.multiselect) {
                    this.items.length = 0;
                }
                this.callDataGridMethod('selectRows', this.items);
                this.selectedItems = this.callDataGridMethod('getSelectedRows');
                this.selectedItemChange.next(this.selectedItems);
                // On render, apply the filters set for query service variable
                if (this._isPageSearch && this.filterInfo) {
                    this.searchSortHandler(this.filterInfo, undefined, 'search');
                }
            });
        },
        onRowSelect: (row, e) => {
            this.ngZone.run(() => {
                this.selectedItems = this.callDataGridMethod('getSelectedRows');
                this.selectedItemChange.next(this.selectedItems);
                const rowData = this.addRowIndex(row);
                this.invokeEventCallback('rowselect', {$data: rowData, $event: e, row: rowData});
            });
        },
        // assigns the items on capture phase of the click handler.
        assignSelectedItems: (row, e) => {
            this.ngZone.run(() => {
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
            });
        },
        onRowDblClick: (row, e) => {
            const rowData = this.addRowIndex(row);
            this.invokeEventCallback('rowdblclick', {$data: rowData, $event: e, row: rowData});
        },
        onRowDeselect: (row, e) => {
            if (this.multiselect) {
                this.ngZone.run(() => {
                    this.items = _.pullAllWith(this.items, [row], _.isEqual);
                    this.selectedItems = this.callDataGridMethod('getSelectedRows');
                    this.invokeEventCallback('rowdeselect', {$data: row, $event: e, row});
                });
            }
        },
        callOnRowDeselectEvent: (row, e) => {
            this.items = this.selectedItems = this.callDataGridMethod('getSelectedRows');
            this.invokeEventCallback('rowdeselect', {$data: row, $event: e, row});
        },
        callOnRowClickEvent: (row, e) => {
            // WMS-18774: If we invoke navigation action variable on rowclick callback, the navigation is triggering outside angular zone so adding ngZone.run
            this.ngZone.run(() => {
                // Call row click only if click is triggered by user
                if (e && e.hasOwnProperty('originalEvent')) {
                    const rowData = this.addRowIndex(row);
                    this.invokeEventCallback('rowclick', {$data: rowData, $event: e, row: rowData});
                }
            });
        },
        closePopover: closePopover,
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
            this.invokeEventCallback('headerclick', {$event: e, $data: col, column: col});
        },
        onRowDelete: (row, cancelRowDeleteCallback, e, callBack, options) => {
            this.ngZone.run(() => {
                this.deleteRecord(_.extend({}, options, {row, 'cancelRowDeleteCallback': cancelRowDeleteCallback, 'evt': e, 'callBack': callBack}));
            });
        },
        onRowInsert: (row, e, callBack, options) => {
            this.insertRecord(_.extend({}, options, {row, event: e, 'callBack': callBack}));
        },
        beforeRowUpdate: (row, eventName?) => {
            if (this._liveTableParent) {
                this._liveTableParent.updateRow(row, eventName);
            }
            this.prevData = getClonedObject(row);
        },
        afterRowUpdate: (row, e, callBack, options) => {
            this.updateRecord(_.extend({}, options, {row, 'prevData': this.prevData, 'event': e, 'callBack': callBack}));
        },
        onBeforeRowUpdate: (row, e, options) => {
            return this.invokeEventCallback('beforerowupdate', {$event: e, $data: row, row, options: options});
        },
        onBeforeRowInsert: (row, e, options) => {
            return this.invokeEventCallback('beforerowinsert', {$event: e, $data: row, row, options: options});
        },
        onBeforeRowDelete: (row, e, options) => {
            const rowData = this.addRowIndex(row);
            return this.invokeEventCallback('beforerowdelete', {$event: e, row: rowData, options: options});
        },
        onFormRender: ($row, e, operation, alwaysNewRow) => {
            const widget = alwaysNewRow ? 'inlineInstanceNew' : 'inlineInstance';
            setTimeout(() => {
                this.formWidgets = {};
                this.fieldDefs.forEach(col => {
                    if (col[widget]) {
                        this.formWidgets[col.field] = col[widget];
                        // Adding formwidgets to the context for inlineinstance widget when fieldDefs were ready
                        if (col[widget].context) {
                            col[widget].context.formWidgets = this.formWidgets;
                        }
                        this.setDisabledOnField(operation, col, widget);
                    }
                });
                this.invokeEventCallback('formrender', {$event: e, formWidgets: this.formWidgets, $operation: operation});
            }, 250);
        },
        onBeforeFormRender: (row, e, operation) => {
            return this.invokeEventCallback('beforeformrender', {$event: e, row, $operation: operation});
        },
        registerRowNgClassWatcher: (rowData, index) => {
            if (!this.rowngclass) {
                return;
            }
            const row = this.getClonedRowObject(rowData);
            const watchName = `${this.widgetId}_rowNgClass_${index}`;
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
            const watchName = `${this.widgetId}_colNgClass_${rowIndex}_${colIndex}`;
            $unwatch(watchName);
            this.registerDestroyListener($watch(colDef['col-ng-class'], this.viewParent, {row}, (nv, ov) => {
                this.callDataGridMethod('applyColNgClass', getConditionalClasses(nv, ov), rowIndex, colIndex);
            }, watchName));
        },
        clearCustomExpression: () => {
            this.customExprViewRef.clear();
            this.customExprCompiledTl = {};
            this.customExprCompiledSummaryTl = {};
        },
        clearRowDetailExpression: () => {
            this.rowDetailViewRef.clear();
            this.rowDefMap = {};
            this.rowDefInstances = {};
        },
        generateCustomExpressions: (rowData, index, summaryRow?) => {
            const row = this.getClonedRowObject(rowData);
            const compileTemplate = (tmpl) => {
                if (!tmpl) {
                    return;
                }
                const colDef = {};
                const context = {
                    row,
                    colDef
                };
                this.addEventsToContext(context);
                const customExprView = this.customExprViewRef.createEmbeddedView(tmpl, context);
                const rootNode = customExprView.rootNodes[0];
                const fieldName = rootNode.getAttribute('data-col-identifier');
                _.extend(colDef, this.columns[fieldName]);
                if(!summaryRow){
                    this.customExprCompiledTl[fieldName + index] = rootNode;
                }else{
                    this.customExprCompiledSummaryTl[fieldName + index] = rootNode;
                }
            };
            if (this.isdynamictable) {
                this.fieldDefs.forEach(col => {
                    compileTemplate(col.customExprTmpl);
                });
                return;
            }
            // For all the columns inside the table, generate the custom expression
            this.customExprTmpl.forEach(compileTemplate.bind(this));
        },
        generateRowExpansionCell: (rowData, index) => {
            const row = this.getClonedRowObject(rowData);
            // For all the columns inside the table, generate the inline widget
            this.rowExpansionActionTmpl.forEach((tmpl) => {
                this.rowExpansionActionTl[index] = this.rowExpansionActionViewRef.createEmbeddedView(tmpl, {row}).rootNodes;
            });
        },
        getRowExpansionAction: (index) => {
            return this.rowExpansionActionTl[index];
        },
        generateRowDetailView: ($event, rowData, rowId, $target, $overlay, callback) => {
            const row = this.getClonedRowObject(rowData);
            const rowDef = getClonedObject(this.rowDef);
            if (this.rowInstance.invokeEventCallback('beforerowexpand', {$event, $data: rowDef, row}) === false) {
                return;
            }
            if (!rowDef.content) {
                return;
            }
            // Expand the row detail
            callback();
            // Row is already rendered. Return here
            if (this.rowDefMap[rowId] && this.rowDefMap[rowId].content === rowDef.content) {
                this.rowInstance.invokeEventCallback('rowexpand', {$event, row, $data: this.rowDefInstances[rowId]});
                return;
            }
            this.rowDefMap[rowId] = rowDef;
            $target.empty();
            $target.hide();
            $overlay.show();
            const context = {
                    row,
                    rowDef,
                    containerLoad: (widget) => {
                        setTimeout(() => {
                            $overlay.hide();
                            $target.show();
                            this.rowDefInstances[rowId] = widget;
                            this.rowInstance.invokeEventCallback('rowexpand', {$event, row, $data: widget});
                        }, 500);
                    }};
            const rootNode = this.rowDetailViewRef.createEmbeddedView(this.rowExpansionTmpl, context).rootNodes[0];
            $target[0].appendChild(rootNode);
            $appDigest();
        },
        onBeforeRowCollapse: ($event, row, rowId) => {
            return this.rowInstance.invokeEventCallback('beforerowcollapse', {$event, row, $data: this.rowDefInstances[rowId]});
        },
        onRowCollapse: ($event, row) => {
            this.rowInstance.invokeEventCallback('rowcollapse', {$event, row});
        },
        getCustomExpression: (fieldName, index, summaryRow?) => {
            let customExpression;
            if (!summaryRow) {
                customExpression = this.customExprCompiledTl[fieldName + index];
            } else {
                customExpression = this.customExprCompiledSummaryTl[fieldName + index];
            }
            return customExpression || '';
        },
        clearRowActions: () => {
            this.rowActionsViewRef.clear();
            this.rowActionsCompiledTl = {};
            this.rowExpansionActionViewRef.clear();
            this.rowExpansionActionTl = {};
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
                    let fieldName;
                    const context = {
                        row,
                        getControl: () => {
                            return this.ngform.controls[fieldName + '_new'] || {};
                        },
                        getValidationMessage: () => {
                            return this.columns[fieldName] && this.columns[fieldName].validationmessage;
                        },
                        getPendingSpinnerStatusNew: () => {
                            return this.columns[fieldName] && this.columns[fieldName].showPendingSpinnerNew;
                        }
                    };
                    const rootNode = this.inlineEditNewViewRef.createEmbeddedView(tmpl, context).rootNodes[0];
                    fieldName = rootNode.getAttribute('data-col-identifier');
                    this.inlineNewCompliedTl[fieldName] = rootNode;
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
                let fieldName;
                const context = {
                    row,
                    getControl: () => {
                        return this.ngform.controls[fieldName] || {};
                    },
                    getValidationMessage: () => {
                        return this.columns[fieldName] && this.columns[fieldName].validationmessage;
                    },
                    getPendingSpinnerStatus: () => {
                        return this.columns[fieldName] && this.columns[fieldName].showPendingSpinner;
                    }
                 };
                const rootNode = this.inlineEditViewRef.createEmbeddedView(tmpl, context).rootNodes[0];
                fieldName = rootNode.getAttribute('data-col-identifier');
                this.inlineCompliedTl[fieldName] = rootNode;
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
            this.ngZone.run(() => {
                this.isGridEditMode = val;
                $appDigest();
            });
        },
        setGridState: (val) => {
            this.isLoading = val === 'loading';
        },
        noChangesDetected: () => {
            this.toggleMessage(true, 'info', 'No Changes Detected', '');
        },
        // Function to redraw the widgets on resize of columns
        redrawWidgets: () => {
            this.fieldDefs.forEach(col => {
                triggerFn(col.inlineInstance && col.inlineInstance.redraw);
                triggerFn(col.inlineInstanceNew && col.inlineInstanceNew.redraw);
                triggerFn(col.filterInstance && col.filterInstance.redraw);
            });
        },
        searchHandler: this.searchSortHandler.bind(this),
        sortHandler: this.searchSortHandler.bind(this),
        timeoutCall: (fn, delay) => {
            setTimeout(fn, delay);
        },
        runInNgZone: fn => {
            this.ngZone.run(fn);
        },
        safeApply: () => {
            $appDigest();
        },
        setTouched: (name) => {
            const ctrl = this.ngform.controls[name];
            if (ctrl) {
                ctrl.markAsTouched();
            }
        },
        clearForm: this.clearForm.bind(this),
        callLoadInlineWidgetData: () => {
            this.fullFieldDefs.forEach(col => {
                if (_.isUndefined(col.isDataSetBound)) {
                    triggerFn(col.loadInlineWidgetData && col.loadInlineWidgetData.bind(col));
                }
            });
        },
        // Function to apply validators to Inline form controls
        applyValidations: (col, alwaysNewRow) => {
            if (alwaysNewRow) {
                triggerFn(col.applyNewRowValidations && col.applyNewRowValidations.bind(col));
            } else {
                triggerFn(col.applyValidations && col.applyValidations.bind(col));
            }
        },
        // Function to remove validators and set form state to untouched for inline form control
        removeValidations: (alwaysNewRow) => {
            this.fullFieldDefs.forEach(col => {
                if (!col.readonly && col.binding !== 'rowOperations') {
                    if (alwaysNewRow) {
                        triggerFn(col.removeNewRowValidations && col.removeNewRowValidations.bind(col));
                    } else {
                        triggerFn(col.removeValidations && col.removeValidations.bind(col));
                    }
                }
            });
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
            if (this.isNavigationEnabled() && this.dataNavigator.dn.currentPage) {
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
            if (!this.isdynamictable && !_.isEmpty(newValue) && gridOptions.colDefs.length) {
                this.invokeEventCallback('beforedatarender', {$data: newValue, $columns: this.columns, data: newValue, columns: this.columns});
            }
            this.setDataGridOption('data', getClonedObject(newValue));
        }
    }

    get gridData() {
        return this._gridData || [];
    }

    get selecteditem() {
        if (this.multiselect) {
            return getClonedObject(this.items);
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
        public inj: Injector,
        public fb: FormBuilder,
        private app: App,
        private dynamicComponentProvider: DynamicComponentRefProvider,
        @Optional() public parentList: ListComponent,
        @Attribute('dataset.bind') public binddataset,
        @Attribute('datasource.bind') public binddatasource,
        @Attribute('readonlygrid') public readonlygrid,
        private ngZone: NgZone
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);

        this.ngform = fb.group({});
        this.addEventsToContext(this.context);

        // Show loading status based on the variable life cycle
        this.app.subscribe('toggle-variable-state', options => {
            if (this.datasource && this.datasource.execute(DataSource.Operation.IS_API_AWARE) && isDataSourceEqual(options.variable, this.datasource)) {
                isDefined(this.variableInflight) ? this.debouncedHandleLoading(options) : this.handleLoading(options);
            }
        });

        this.app.subscribe('setup-cud-listener', param => {
            if (this.name !== param) {
                return;
            }
            this._isDependent = true;
            this.selectedItemChange$
                .pipe(debounceTime(250))
                .subscribe(this.triggerWMEvent.bind(this));
        });

        this.deleteoktext = this.appLocale.LABEL_OK;
        this.deletecanceltext = this.appLocale.LABEL_CANCEL;
    }

    private triggerWMEvent(newVal) {
        if (this.editmode === 'dialog') {
            return;
        }
        $invokeWatchers(true);
        this.app.notify('wm-event', {eventName: 'selectedItemChange', widgetName: this.name, row: newVal, table: this});
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
        this.gridOptions.searchLabel = this.searchlabel;
        this.gridOptions.isMobile = isMobile();
        this.gridOptions.name = this.name;
        // When loadondemand property is enabled(deferload="true") and show is true, only the column titles of the datatable are rendered, the data(body of the datatable) is not at all rendered.
        // Because the griddata is setting before the datatable dom is rendered but we are sending empty data to the datatable.
        if (!_.isEmpty(this.gridData)) {
            this.gridOptions.data = getClonedObject(this.gridData);
        }
        this.gridOptions.messages = {
            'selectField': this.appLocale.MESSAGE_SELECT_FIELD
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

    addRowIndex(row) {
        const rowData = getClonedObject(row);
        const rowIndex = _.indexOf(this.gridOptions.data, row);
        if (rowIndex < 0) {
            return row;
        }
        rowData.$index = rowIndex + 1;
        rowData.$isFirst = rowData.$index === 1;
        rowData.$isLast = this.gridData.length === rowData.$index;
        return rowData;
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

    isNavigationEnabled() {
        return this.shownavigation && this.dataNavigator && this.dataNavigatorWatched;
    }

    getClonedRowObject(rowData) {
        const row = getClonedObject(rowData);
        row.getProperty = field => {
            return _.get(row, field);
        };
        row.$isFirst = row.$index === 1;
        row.$isLast = this.gridData.length === row.$index;
        delete row.$$index;
        delete row.$$pk;
        return row;
    }

    handleLoading(data) {
        this.variableInflight = data.active;
        // based on the active state and response toggling the 'loading data...' and 'no data found' messages.
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

    setDisabledOnField(operation, colDef, widgetType) {
        if (operation !== 'new' && colDef['primary-key'] && colDef.generator === 'assigned' && !colDef['related-entity-name'] && !colDef.period) {
            colDef[widgetType].disabled = true;
        }
    }

    resetFormControl(ctrl) {
        ctrl.markAsUntouched();
        ctrl.markAsPristine();
    }

    clearForm(newRow?) {
        const ctrls = this.ngform.controls;
        _.keys(this.ngform.controls).forEach(key => {
            // If new row, clear the controls in the new row. Else, clear the controls in edit row
            if (!key.endsWith('_filter') && ((key.endsWith('_new') && newRow) || (!key.endsWith('_new') && !newRow))) {
                ctrls[key].setValue('');
                this.resetFormControl(ctrls[key]);
            }
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
        const data = this.filternullrecords ?  this.removeEmptyRecords(serverData) : serverData;
        if (!this.variableInflight) {
            if (data && data.length === 0) {
                this.callDataGridMethod('setStatus', 'nodata', this.nodatamessage);
            } else {
                this.callDataGridMethod('setStatus', 'ready');
            }
        }
        this.gridData = data;
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
        if (this.dataset && this.binddataset && this.dataNavigator) {
            /*Check for sanity*/
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
            this.dataNavigator.setBindDataSet(this.binddataset, this.viewParent, this.datasource, this.dataset, this.binddatasource);
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
        if (!this.isNavigationEnabled() && this._isClientSearch) {
            data = getClonedObject(serviceData);
            data = this.getSearchResult(data, this.filterInfo);
            data = this.getSortResult(data, this.sortInfo);
            this.serverData = data;
        } else {
            this.serverData = serviceData;
        }
        // If fielddefs are not present, generate fielddefs from data
        // Removing fielddefs check because When loadondemand property is enabled(deferload="true"), the dataset propertychangehanlder is triggered first before the dom is getting rendered.
        // So at that time fielddefs length is zero, due to this the columns are created dynamically.
        if (this.isdynamictable) {
            this.createGridColumns(this.serverData);
        } else {
            this.setGridData(this.serverData);
        }
    }

    // Function to generate and compile the form fields from the metadata
    async generateDynamicColumns(columns) {
        this.fieldDefs = []; // empty the form fields
        // empty the filter field template refs.
        (this.filterTmpl as any)._results = [];

        if (_.isEmpty(columns)) {
            return;
        }

        let tmpl = '';
        columns.forEach(col => {
            let attrsTmpl = '';
            let customTmpl = '';
            _.forEach(col, (val, key) => {
                if (val) {
                    // If custom expression is present, keep it inside table column. Else, keep as attribute
                    if (key === 'customExpression') {
                        customTmpl = val;
                    } else {
                        attrsTmpl += ` ${key}="${val}"`;
                    }
                }
            });
            tmpl += `<wm-table-column ${attrsTmpl} tableName="${this.name}">${customTmpl}</wm-table-column>`;
        });
        this.dynamicTableRef.clear();
        if (!this._dynamicContext) {
            this._dynamicContext = Object.create(this.viewParent);
            this._dynamicContext[this.getAttr('wmTable')] = this;
        }
        this.noOfColumns = columns.length;
        const componentFactoryRef = await this.dynamicComponentProvider.getComponentFactoryRef(
            'app-table-dynamic-' + this.widgetId,
            tmpl,
            {
                noCache: true,
                transpile: true
            });
        const component = this.dynamicTableRef.createComponent(componentFactoryRef, 0, this.inj);
        extendProto(component.instance, this._dynamicContext);
        this.$element.find('.dynamic-table-container')[0].appendChild(component.location.nativeElement);
    }

    prepareColDefs(data) {
        let defaultFieldDefs;
        let properties;

        this.fieldDefs = [];
        this.headerConfig = [];
        this.columns = {};
        /* if properties map is existed then fetch the column configuration for all nested levels using util function */
        properties = data;
        /*call utility function to prepare fieldDefs for grid against given data (A MAX OF 10 COLUMNS ONLY)*/
        defaultFieldDefs = prepareFieldDefs(properties);

        /*append additional properties*/
        _.forEach(defaultFieldDefs, columnDef => {
            columnDef.binding = columnDef.field;
            columnDef.caption = columnDef.displayName;
            columnDef.pcDisplay = true;
            columnDef.mobileDisplay = true;
            columnDef.searchable = true;
            columnDef.type  = 'string';
        });

        defaultFieldDefs.forEach(col => {
            this.columns[col.field] = col;
        });

        this.invokeEventCallback('beforedatarender', {$data: data, $columns: this.columns, data: data, columns: this.columns});

        defaultFieldDefs = [];
        // Apply the changes made by the user
        _.forEach(this.columns, val => {
            defaultFieldDefs.push(val);
        });

        this.generateDynamicColumns(defaultFieldDefs);
    }

    createGridColumns(data) {
        /* this call back function receives the data from the variable */
        /* check whether data is valid or not */
        const dataValid = data && !data.error;
        /*if the data is type json object, make it an array of the object*/
        if (dataValid && !_.isArray(data)) {
            data = [data];
        }
        /* if the data is empty, show nodatamessage */
        if (_.isEmpty(data)) {
            this.setGridData(data);
            return;
        }

        if (!dataValid) {
            return;
        }
        /* if new columns to be rendered, prepare default fieldDefs for the data provided*/
        this.prepareColDefs(data);

        this.serverData = data;
        this.setGridData(this.serverData);
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

        let sortExp = this.getSortExpr();
        let sortExpArr = sortExp.split(' ');
        if(sortExp && sortExpArr.length){
            this.sortInfo = {
                direction : sortExpArr[1],
                field:  sortExpArr[0]

            };
        }

        /*Return if data is invalid.*/
        if (!this.isDataValid()) {
            return;
        }

        // If value is empty or in studio mode, dont enable the navigation
        if (newVal) {
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

        if (!this.isNavigationEnabled() && newVal) {
            this.checkFiltersApplied(this.getSortExpr());
        }

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
                if (this.binddatasource && !this.datasource) {
                    return;
                }
                // if table is inside list then table dataset will be set as "item.XXX" and there is no datasource.
                // So extracting datasource from the datset bound expression.
                if (this.parentList && !this.datasource && _.startsWith(this.binddataset, 'item')) {
                    this.datasource = getDatasourceFromExpr(this.widget.$attrs.get('datasetboundexpr'), this);
                }
                this.watchVariableDataSet(nv);
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

    // this method will render the filter row.
    renderDynamicFilterColumn(filteTemRef) {
        // For dynamic table manually pushing the filtertemplateRef as templateRef will not be available prior.
        if (this.isdynamictable) {
            (this.filterTmpl as any)._results.push(filteTemRef);
        }
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
        if(tableColumn['primary-key']){
            this.primaryKey.push(tableColumn.field);
        }
        const colCount = this.fieldDefs.push(tableColumn);
        this.fullFieldDefs.push(tableColumn);
        this.rowFilter[tableColumn.field] = {
            value: undefined
        };
        this.fieldDefs.forEach(col => {
            this.columns[col.field] = col;
        });
        // If dynamic datatable and last column, pass the columns to jquery datatable
        if (this.isdynamictable && colCount === this.noOfColumns) {
            this.renderOperationColumns();
            this.setDataGridOption('colDefs', this.fieldDefs);
        }
    }

    registerFormField(name, formField) {
        this.formfields[name] = formField;
    }

    registerActions(tableAction) {
        this.actions.push(tableAction);
        this.populateActions();
    }

    registerRow(tableRow, rowInstance) {
        this.rowDef = tableRow;
        this.rowInstance = rowInstance;
        this.callDataGridMethod('option', 'cssClassNames.rowExpandIcon', this.rowDef.expandicon);
        this.callDataGridMethod('option', 'cssClassNames.rowCollapseIcon', this.rowDef.collapseicon);
        this.gridOptions.rowExpansionEnabled = true;
        this.gridOptions.rowDef = this.rowDef;
    }

    registerRowActions(tableRowAction) {
        this.rowActions.push(tableRowAction);
    }

    selectItem(item, data) {
        /* server is not updating immediately, so set the server data to success callback data */
        if (data) {
            this.serverData = data;
        }
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

    expandRow(rowId) {
        this.callDataGridMethod('expandRow', rowId);
    }

    collapseRow(rowId) {
        this.callDataGridMethod('collapseRow', rowId);
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

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'select') {
            super.handleEvent(this.nativeElement, eventName, callback, locals);
        }
    }

    triggerUploadEvent($event, eventName, fieldName, row) {
        const params: any = {$event, row};
        if (!this.columns[fieldName]) {
            return;
        }
        if (eventName === 'change') {
            params.newVal = $event.target.files;
            params.oldVal = this.columns[fieldName]._oldUploadVal;
            this.columns[fieldName]._oldUploadVal = params.newVal;
        }
        this.columns[fieldName].invokeEventCallback(eventName, params);
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
