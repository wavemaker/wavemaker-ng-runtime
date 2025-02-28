import {
    AfterContentInit,
    AfterViewInit,
    Attribute,
    ContentChild,
    ContentChildren,
    TemplateRef,
    Directive,
    Injector,
    OnInit,
    Optional,
    Inject
} from '@angular/core';

import {
    $watch,
    AppDefaults,
    DataSource,
    DataType,
    debounce,
    FormWidgetType,
    getDisplayDateTimeFormat,
    isDateTimeType,
    isDefined
} from '@wm/core';
import { applyFilterOnField, BaseFieldValidations, EDIT_MODE, fetchRelatedFieldData, getDataTableFilterWidget, getDefaultValue, getDistinctFieldProperties, getDistinctValues, getDistinctValuesForField, getEditModeWidget, getWatchIdentifier, isDataSetWidget, provideAsWidgetRef, setHeaderConfigForTable, BaseComponent } from '@wm/components/base';
import { registerProps } from './table-column.props';
import { TableComponent } from '../table.component';
import { TableColumnGroupDirective } from '../table-column-group/table-column-group.directive';
import { debounceTime } from 'rxjs/operators';
import {cloneDeep, forEach, head, includes, last, map, max, mean, min, round, split, sum} from "lodash-es";

const WIDGET_CONFIG = {widgetType: 'wm-table-column', hostClass: ''};

let inlineWidgetProps = ['datafield', 'displayfield', 'placeholder', 'searchkey', 'matchmode', 'displaylabel', 'groupby', 'match', 'dateformat', 'showcount', 'collapsible',
                            'checkedvalue', 'uncheckedvalue', 'showdropdownon', 'dataentrymode', 'autoclose', 'dataset', 'outputformat'];
const validationProps = ['maxchars', 'regexp', 'minvalue', 'maxvalue', 'step', 'required', 'mindate', 'maxdate',
                            'excludedates', 'excludedays', 'mintime', 'maxtime'];
inlineWidgetProps = [...inlineWidgetProps, ...validationProps];

class FieldDef {
    widget;

    constructor(widget) {
        this.widget = widget;
    }

    focus() {
        this.widget.focus();
    }

    setProperty(prop, newval) {
        // Get the scope of the current editable widget and set the value
        prop = prop === 'value' ? 'datavalue' : prop;
        this.widget[prop] = newval;
    }

    getProperty(prop) {
        prop = prop === 'value' ? 'datavalue' : prop;
        return this.widget[prop];
    }
}

@Directive({
    selector: '[wmTableColumn]',
    providers: [
        provideAsWidgetRef(TableColumnDirective)
    ]
})
export class TableColumnDirective extends BaseComponent implements OnInit, AfterContentInit, AfterViewInit {
    static initializeProps = registerProps();

    @ContentChildren('filterWidget', { descendants: true }) _filterInstances;
    @ContentChildren('inlineWidget', { descendants: true }) _inlineInstances;
    @ContentChildren('inlineWidgetNew', { descendants: true }) _inlineInstancesNew;
    @ContentChild('customExprTmpl') customExprTmpl;
    @ContentChild('inlineWidgetTmpl') inlineWidthTempRef;

    private _propsInitialized: boolean;
    private _filterDataSet;
    private _isRowFilter;
    private _isInlineEditable;
    private _isNewEditableRow;

    key;
    filterInstance;
    inlineInstance;
    inlineInstanceNew;

    backgroundcolor;
    binding;
    caption;
    dataset;
    defaultvalue;
    editWidgetType;
    filterwidget;
    field;
    formatpattern;
    custompipeformat;
    generator;
    limit;
    mobiledisplay;
    pcdisplay;
    tabletdisplay;
    readonly;
    required;
    maxchars;
    minvalue;
    maxvalue;
    regexp;
    searchable;
    showinfilter;
    show;
    sortable;
    caseinsensitive;
    textalignment;
    textcolor;
    type;
    width;
    datepattern;
    editdatepattern;
    filterdatafield;
    filterdisplayfield;
    filterdisplaylabel;
    filtersearchkey;
    filterplaceholder;
    datafield;
    displayfield;
    displayName;
    pcDisplay;
    mobileDisplay;
    tabletDisplay;
    textAlignment;
    backgroundColor;
    textColor;
    primaryKey;
    relatedEntityName;
    style;
    class;
    ngclass;
    filterOn;
    filterControl;
    isDataSetBound;
    isFilterDataSetBound;
    showPendingSpinner;
    showPendingSpinnerNew;
    validationmessage;
    activeControlType;
    private _dataoptions: any;
    private _datasource: any;
    private notifyForFields: any;
    private fieldValidations;
    private fieldValidations_new;

    private syncValidators = [];
    private asyncValidators = [];
    private observeOnFields = [];

    @ContentChild('filterTmpl') filterTemplateRef: TemplateRef<any>;

    constructor(
        inj: Injector,
        private appDefaults: AppDefaults,
        @Optional() public table: TableComponent,
        @Optional() public group: TableColumnGroupDirective,
        @Attribute('filterdataset.bind') public bindfilterdataset,
        @Attribute('dataset.bind') public binddataset,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        super(inj, WIDGET_CONFIG, explicitContext);

        this.notifyForFields = [];
    }

    get dataoptions() {
        return this._dataoptions;
    }

    set dataoptions(options) {
        this._dataoptions = options;
    }

    get datasource() {
        return this._datasource;
    }

    set datasource(ds) {
        this._datasource = ds;
    }

    ngOnInit() {
        super.ngOnInit();

        // Set the default values and register with table
        this.populateFieldDef();
        // when column is inside a group then consider the col index and not header index.
        const colIndex = parseInt(this.getAttr('index'), 10);
        const headerIndex = parseInt(this.getAttr('headerIndex'), 10);
        const fieldName = this.group && this.group.name;
        // Register column with header config to create group structure
        setHeaderConfigForTable(this.table.headerConfig, {
            field: this.field,
            displayName: this.displayName
        }, fieldName, fieldName ? colIndex : headerIndex);

        this.table.registerColumns(this.widget, colIndex);

        this._isRowFilter = this.table.filtermode === 'multicolumn' && this.searchable;
        this._isInlineEditable = !this.readonly && (this.table.editmode !== EDIT_MODE.DIALOG && this.table.editmode !== EDIT_MODE.FORM);
        this._isNewEditableRow = this._isInlineEditable && this.table.editmode === EDIT_MODE.QUICK_EDIT && this.table.shownewrow;
        this.setUpControls();

        this._propsInitialized = true;

        // Inline control status change subscriber
        if (this.getFormControl()) {
            const onStatusChangeSubscription = this.getFormControl().statusChanges
                .pipe(debounceTime(100))
                .subscribe(status => this.onStatusChange(status, 'inlineInstance'));
            this.registerDestroyListener(() => onStatusChangeSubscription.unsubscribe());
            // Instantiate custom validators class for inline edit form control
            this.fieldValidations = new BaseFieldValidations(this, this['inlineInstance'], this.editWidgetType, this.getFormControl(), this.table, 'inlineInstance');
        }

        // Quick edit new row control status change subscriber
        if (this._checkNewEditableRowControl()) {
            const onStatusChangeSubscription_new = this.getFormControl('_new').statusChanges
                .pipe(debounceTime(100))
                .subscribe(status => this.onStatusChange(status, 'inlineInstanceNew'));
            this.registerDestroyListener(() => onStatusChangeSubscription_new.unsubscribe());
            // Instantiate custom validators class for Quick edit newrow form control
            this.fieldValidations_new = new BaseFieldValidations(this, this['inlineInstanceNew'], this.editWidgetType, this.getFormControl('_new'), this.table, 'inlineInstanceNew');
        }
    }

    ngAfterContentInit() {
        if (this._isRowFilter) {
            // Listen on the inner row filter widget and setup the widget
            const s1 = this._filterInstances.changes.subscribe((val) => {
                this.filterInstance = val.first && val.first.widget;
                this.setUpFilterWidget();
            });
            this.registerDestroyListener(() => s1.unsubscribe());
        }

        if (this._isInlineEditable) {
            const s2 = this._inlineInstances.changes.subscribe((val) => {
                // Listen on the inner inline widget and setup the widget
                this.inlineInstance = val.first && val.first.widget;
                this.fieldValidations.formwidget = val.first;
                this.table.registerFormField(this.binding, new FieldDef(this.inlineInstance));
                this.setUpInlineWidget('inlineInstance');
            });
            this.registerDestroyListener(() => s2.unsubscribe());

            if (this._isNewEditableRow) {
                const s3 = this._inlineInstancesNew.changes.subscribe((val) => {
                    // Listen on the inner inline widget and setup the widget
                    this.inlineInstanceNew = val.first && val.first.widget;
                    this.fieldValidations_new.formwidget = val.first;
                    this.setUpInlineWidget('inlineInstanceNew');
                });
                this.registerDestroyListener(() => s3.unsubscribe());
            }
        }
        this.registerReadyStateListener(() => {
            this.key = this.field || this.binding;
        });
        super.ngAfterContentInit();
        if ((this as any).table.isdynamictable) {
            (this.table.inlineWidgetTmpl as any)._results.push(this.inlineWidthTempRef);
        }
    }

    ngAfterViewInit() {
        // manually listing the table column templateRef as templateRef will not be available prior.
        if (this.filterTemplateRef) {
            this.table.renderDynamicFilterColumn(this.filterTemplateRef);
        }
    }

    // Apply default|sync|async|prop validators for inline form control
    applyValidations() {
        if (!this.getFormControl()) {
            return;
        }
        if (this.syncValidators.length > 0) {
            this.fieldValidations.setValidators(this.syncValidators);
        }
        this.fieldValidations.setUpValidators();
        if (this.asyncValidators.length > 0) {
            this.fieldValidations.setAsyncValidators(this.asyncValidators);
        }
        if (this.observeOnFields.length > 0) {
            this.fieldValidations.observeOn(this.observeOnFields, 'columns');
        }
    }

    // Remove validators for the inline widget and set form to untouched
    removeValidations() {
        this.table.ngform.markAsUntouched();
        const control = this.getFormControl();
        if (!control) {
            return;
        }
        control.clearValidators();
        control.clearAsyncValidators();
        control.updateValueAndValidity();
    }

    // Apply default|sync|async|prop validators for QuickEdit new row form control
    applyNewRowValidations() {
        if (!this._checkNewEditableRowControl()) {
            return;
        }
        if (this.syncValidators.length > 0) {
            this.fieldValidations_new.setValidators(this.syncValidators);
        }
        this.fieldValidations_new.setUpValidators();
        if (this.asyncValidators.length > 0) {
            this.fieldValidations_new.setAsyncValidators(this.asyncValidators);
        }
        if (this.observeOnFields.length > 0) {
            this.fieldValidations_new.observeOn(this.observeOnFields, 'columns');
        }
    }

    // Remove validators for the QuickEdit new row widget and set form to untouched
    removeNewRowValidations() {
        this.table.ngform.markAsUntouched();
        if (!this._checkNewEditableRowControl()) {
            return;
        }
        const control = this.getFormControl('_new');
        control.clearValidators();
        control.clearAsyncValidators();
        control.updateValueAndValidity();
    }

    addFormControl(suffix?: string) {
        const ctrlName = suffix ? (this.binding + suffix) : this.binding;
        this.table.ngform.addControl(ctrlName, this.table.fb.control(''));
    }

    getFormControl(suffix?: string) {
        const ctrlName = suffix ? (this.binding + suffix) : this.binding;
        return this.table.ngform.controls[ctrlName];
    }

    private _checkNewEditableRowControl() {
        return this._isNewEditableRow && this.getFormControl('_new');
    }

    // Setup the inline edit and filter widget
    setUpControls() {
        if (this._isInlineEditable) {
            if (this.editWidgetType === FormWidgetType.UPLOAD) {
                return;
            }
            this.addFormControl();
            const control = this.getFormControl();
            if (control) {
                const onValueChangeSubscription =  control.valueChanges
                    .pipe(debounceTime(200))
                    .subscribe(value => this.onValueChange(value, 'inlineInstance'));
                this.registerDestroyListener(() => onValueChangeSubscription.unsubscribe());
            }

            if (this._isNewEditableRow) {
                this.addFormControl('_new');
                const newControl = this.getFormControl('_new');
                if (newControl) {
                    const onNewValueChangeSubscription =  newControl.valueChanges
                        .pipe(debounceTime(200))
                        .subscribe(value => this.onValueChange(value, 'inlineInstanceNew'));
                    this.registerDestroyListener(() => onNewValueChangeSubscription.unsubscribe());
                }
            }
        }

        if (this._isRowFilter) {
            this.addFormControl('_filter');
            this.filterControl = this.getFormControl('_filter');
            if (this.filterControl) {
                const onFilterValueSubscription = this.filterControl.valueChanges.subscribe(this.onFilterValueChange.bind(this));
                this.registerDestroyListener(() => onFilterValueSubscription.unsubscribe());
            }
        }
    }

    // Reset the row filter value
    resetFilter() {
        if (this.filterControl) {
            this.filterControl.setValue('');
        }
        if (this.filterwidget === FormWidgetType.AUTOCOMPLETE) {
            this.filterInstance.query = '';
            this.filterInstance.queryModel = '';
        }
    }

    // On field value change, propagate event to parent form
    onFilterValueChange(val) {
        this.table.rowFilter[this.field].value = val;
    }

    // Get of the active from control
    get datavalue() {
        return this[this.activeControlType] && this[this.activeControlType].datavalue;
    }

    set datavalue(val) {
        const control = this.getFormControl(this.activeControlType === 'inlineInstanceNew' ? '_new' : undefined);
        if (!control) {
            return;
        }
        if (control && this.editWidgetType !== FormWidgetType.UPLOAD) {
            control.setValue(val);
        }
    }

    get value() {
        return this.datavalue;
    }

    set value(val) {
        this.datavalue = val;
    }

    // On field value change, apply cascading filter and set validation message
    onValueChange(val, widget) {
        if (val !== null) {
            applyFilterOnField(this.table.datasource, this.widget, this.table.fieldDefs, val, {
                widget: 'edit-widget-type'
            });
        }
        if (this.table.ngform.touched) {
            this.activeControlType = widget;
            if (widget === 'inlineInstance') {
                this.notifyChanges();
                this.fieldValidations.setCustomValidationMessage();
            } else if (this._isNewEditableRow) {
                this.notifyChanges('_new');
                this.fieldValidations_new.setCustomValidationMessage();
            }
        }
    }

    loadFilterData() {
        // If filterdataset is not bound, get the data implicitly
        if (this._isRowFilter && isDataSetWidget(this.filterwidget) && !this.bindfilterdataset) {
            // For live variable, get the data using distinct API
            if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_DISTINCT_API)) {
                // check for related entity columns
                if (this.relatedEntityName) {
                    this.widget['is-related']  = true;
                    this.widget['lookup-type']  = this.relatedEntityName;
                    this.widget['lookup-field'] = last(split(this.field, '.'));
                }
                if (this.filterwidget === FormWidgetType.AUTOCOMPLETE) {
                    this.filterInstance.dataoptions = getDistinctFieldProperties(this.table.datasource, this);
                    this.filterInstance.datasource = this.table.datasource;
                } else {
                    getDistinctValues(this.table.datasource, this.widget, 'filterwidget').then((res: any) => {
                        this._filterDataSet = res.data;
                        this.setFilterWidgetDataSet();
                    });
                }
            } else {
                // For other datasources, get the data from datasource bound to table
                //[Todo-CSP]: watch fn should already be generated from table dataset.bind expr
                this.registerDestroyListener(
                    $watch(
                        this.table.binddataset,
                        this.viewParent,
                        {},
                        nv => this.widget.filterdataset = nv,
                        getWatchIdentifier(this.widgetId, 'filterdataset')
                    )
                );
            }
        }
    }

    loadInlineWidgetData() {
        // If dataset is not bound, get the data implicitly
        if (isDataSetWidget(this['edit-widget-type']) && !this.binddataset && !this.readonly) {
            const dataSource = this.table.datasource;
            if (this['related-entity-name'] && this['primary-key']) {
                // Fetch the data for the related fields
                this.isDataSetBound = true;
                const bindings = split(this.binding, '.');
                this.showPendingSpinner = true;
                fetchRelatedFieldData(dataSource, this.widget, {
                    relatedField: head(bindings),
                    datafield: last(bindings),
                    widget: 'edit-widget-type'
                });
            } else if (dataSource.execute(DataSource.Operation.SUPPORTS_DISTINCT_API)) {
                getDistinctValuesForField(dataSource, this.widget, {
                    widget: 'edit-widget-type'
                });
            }
        }
    }

    // On table datasource change, get the data for row filters
    onDataSourceChange() {
        this.loadFilterData();
        if (this.table.editmode === EDIT_MODE.QUICK_EDIT) {
            this.loadInlineWidgetData();
        }
    }

    // Set the data on the row filter widget
    setFilterWidgetDataSet() {
        if (this.filterInstance) {
            this.filterInstance.dataset = this._filterDataSet;
        }
    }

    // Set the props on the row filter widget
    setUpFilterWidget() {
        this.filterInstance.registerReadyStateListener(() => {
            if (isDataSetWidget(this.filterwidget)) {
                // if binding is department.deptId then field will be deptId
                const field = last(this.binding.split('.'));
                this.filterInstance.dataset = this._filterDataSet;
                this.filterInstance.datafield = this.filterdatafield || field;
                this.filterInstance.displayfield = this.filterdisplayfield || field;
                if (this.filterwidget === FormWidgetType.AUTOCOMPLETE) {
                    this.filterInstance.displaylabel = this.filterdisplaylabel || field;
                    this.filterInstance.searchkey = this.filtersearchkey || field;
                }
            }
            if (this.filterwidget === FormWidgetType.TIME) {
                this.filterInstance.timepattern = this.appDefaults.timeFormat || 'hh:mm:ss a';
            }
            this.filterInstance.placeholder = this.filterplaceholder || '';
        });
    }

    // Notifies all the dependent validation controls incase of any changes
    notifyChanges(quickEdit?) {
        forEach(this.notifyForFields, field => {
            if (quickEdit && this._isNewEditableRow) {
                field.fieldValidations_new.validate();
            } else {
                field.fieldValidations.validate();
            }
        });
    }

    // Watches control for dependent validation changes
    observeOn(fields) {
        this.observeOnFields = cloneDeep(fields);
    }

    // Sets the default validators inline and quickedit new row using props
    setUpValidators() {
        this.fieldValidations.setUpValidators();
        if (this._checkNewEditableRowControl()) {
            this.fieldValidations_new.setUpValidators();
        }
    }

    // Sets the Async validators on the inline and quickedit new row form control
    setAsyncValidators(validators) {
        this.asyncValidators = cloneDeep(validators);
    }

    // Sets the default/custom validators on the inline and quickedit new row form control
    setValidators(validators) {
        this.syncValidators = cloneDeep(validators);
    }

    boundFn(fn) {
        return fn();
    }

    // Shows spinner for async validators based on status
    onStatusChange(status, type) {
        this['showPendingSpinner' + (type === 'inlineInstance' ? '' : 'New')] = (status === 'PENDING');
    }

    /* Summary Row Logic start */
    setSummaryRowData(data) {
        const newData = (data instanceof Array) ? data : [data];
        this._invokeSummaryRowData(newData);
    }

    private _invokeSummaryRowData(data) {
        forEach(data, (item, index) => {
            const content = item;
            if (content instanceof Promise) {
                content.then(res => {
                    this.table.callDataGridMethod('setSummaryRowDef', this.key, res, index, true);
                });
            } else if (content.value && content.value instanceof Promise) {
                const contentData = content;
                content.value.then(res => {
                    contentData.value = res;
                    this.table.callDataGridMethod('setSummaryRowDef', this.key, contentData, index, true);
                });
            }
            this.table.callDataGridMethod('setSummaryRowDef', this.key, content, index);
        });
    }
    private _getColumnData() {
        return map(this.table.dataset, this.binding);
    }

    public aggregate = {
        sum: () => {
            return sum(this._getColumnData());
        },
        average: (precision: number = 2) => {
            return round(mean(this._getColumnData()), precision);
        },
        count: () => {
            return this._getColumnData().length;
        },
        minimum: () => {
            return min(this._getColumnData());
        },
        maximum: () => {
            return max(this._getColumnData());
        },
        percent: (value, precision: number = 2) => {
            return round((sum(this._getColumnData()) / value) * 100, precision);
        }
    };
    /* Summary Row Logic end */

    // Set the props on the inline edit widget
    setInlineWidgetProp(widget, prop, nv) {
        if (prop === 'datepattern' && this.editWidgetType === FormWidgetType.TIME) {
            prop = 'timepattern';
        }
        if (this[widget] && isDefined(nv)) {
            this[widget][prop] = nv;
        }
    }

    // Initialize the inline edit widget
    setUpInlineWidget(widget) {
        this[widget].registerReadyStateListener(() => {
            if (isDataSetWidget(this['edit-widget-type'])) {
                this[widget].dataset = this.dataset;
            }
            inlineWidgetProps.forEach(key => {
                this.setInlineWidgetProp(widget, key, this[key]);
            });
            this[widget].datasource = this._datasource;
            this[widget].dataoptions = this._dataoptions;
            this.setInlineWidgetProp(widget, 'datepattern', this.editdatepattern);
        });
    }

    getStyleDef() {
        return `width: ${this.width || ''}; background-color: ${this.backgroundcolor || ''}; color: ${this.textcolor || ''};`;
    }

    populateFieldDef() {
        this.width = this.width === 'px' ?  '' : (this.width || '');
        this.field = this.binding;
        this.displayName =  this.caption || '';
        this.pcDisplay =  this.pcdisplay;
        this.mobileDisplay =  this.mobiledisplay;
        this.tabletDisplay =  this.tabletdisplay;
        this.textAlignment =  this.textalignment;
        this.backgroundColor =  this.backgroundcolor;
        this.textColor =  this.textcolor;
        this.primaryKey =  this['primary-key'];
        this.relatedEntityName =  this['related-entity-name'];
        this.style =  this.getStyleDef();
        this.class =  this['col-class'];
        this.ngclass =  this['col-ng-class'];
        this.formatpattern =  this.formatpattern === 'toNumber' ? 'numberToString'  :  this.formatpattern;
        this.searchable =  (this.type === 'blob' || this.type === 'clob') ? false  :  this.searchable;
        this.showinfilter = (this.nativeElement.hasAttribute('showinfilter') && !((this as any).table && (this as any).table.isdynamictable)) ? this.nativeElement.getAttribute('showinfilter') : (this.show);
        this.limit =  this.limit ? +this.limit  :  undefined;
        this.editWidgetType = this['edit-widget-type'] =  this['edit-widget-type'] || getEditModeWidget(this);
        this.filterOn =  this['filter-on'];
        this.readonly = isDefined(this.getAttr('readonly')) ? this.getAttr('readonly') === 'true' : (this['related-entity-name'] ? !this['primary-key'] : includes(['identity', 'uniqueid', 'sequence'], this.generator));
        this.filterwidget =  this.filterwidget || getDataTableFilterWidget(this.type || 'string');
        this.isFilterDataSetBound = !!this.bindfilterdataset;
        this.defaultvalue = getDefaultValue(this.defaultvalue, this.type, this.editWidgetType);
        this.caseinsensitive =  !!this.getAttr('caseinsensitive');

        // For date time data types, if date pattern is not specified, set the app format or default format
        if (isDateTimeType(this.type) && this.formatpattern === 'toDate' && !this.datepattern) {
            const defaultFormat = getDisplayDateTimeFormat(this.type);
            if (this.type === DataType.DATE) {
                this.datepattern  = this.appDefaults.dateFormat || defaultFormat;
            } else if (this.type === DataType.TIME) {
                this.datepattern  = this.appDefaults.timeFormat || defaultFormat;
            } else if (this.type === DataType.TIMESTAMP || this.type === DataType.DATETIME) {
                this.datepattern  = this.appDefaults.dateTimeFormat || defaultFormat;
            }
        }
    }

    onPropertyChange(key, nv, ov) {
        if (!this._propsInitialized) {
            return;
        }
        switch (key) {
            case 'caption':
                this.displayName = nv || '';
                this.setProperty('displayName', this.displayName);
                // Fix for [WMS-25934]: update the headerConfig list when there is change in display name
                // when column is inside a group then consider the col index and not header index.
                const fieldName = this.group && this.group.name;
                const index: number = fieldName ? parseInt(this.getAttr('index'), 10) : parseInt(this.getAttr('headerIndex'), 10);
                // Register column with header config to create group structure
                if (!this.table.headerConfig.some(value => this.field == value.field)) {
                    setHeaderConfigForTable(this.table.headerConfig, {
                        field: this.field,
                        displayName: this.displayName
                    }, fieldName, index);
                }
                else {
                    this.table.headerConfig.map(value => {
                        if (this.field == value.field) {
                            value.displayName = this.displayName;
                        }
                    });
                }
                break;
            case 'defaultvalue':
                this.defaultvalue = getDefaultValue(this.defaultvalue, this.type, this.editWidgetType);
                break;
            case 'show':
                this.table.redraw(true);
                this.showinfilter = this.nativeElement.hasAttribute('showinfilter') ? this.nativeElement.getAttribute('showinfilter') : nv;
                break;
            case 'filterdataset':
                this._filterDataSet = nv;
                this.setFilterWidgetDataSet();
                break;
            case 'editdatepattern':
                this.setInlineWidgetProp('inlineInstance', 'datepattern', nv);
                this.setInlineWidgetProp('inlineInstanceNew', 'datepattern', nv);
                break;
            case 'showinfilter':
                this.showinfilter = nv;
                break;
            default:
                if (inlineWidgetProps.includes(key)) {
                    this.setInlineWidgetProp('inlineInstance', key, nv);
                    this.setInlineWidgetProp('inlineInstanceNew', key, nv);
                }
                break;
        }

        super.onPropertyChange(key, nv, ov);
    }

    setProperty(property, nv) {
        this[property] = nv;
        switch (property) {
            case 'displayName':
                this.table.callDataGridMethod('setColumnProp', this.field, property, nv);
                break;
            default:
                this.table.redraw(true);
        }
    }
}
