import { AfterContentInit, AfterViewInit, Attribute, ContentChild, ContentChildren, TemplateRef, Directive, Injector, OnInit, Optional } from '@angular/core';
import { Validators } from '@angular/forms';

import { $watch, AppDefaults, DataSource, DataType, debounce, FormWidgetType, getDisplayDateTimeFormat, isDateTimeType, isDefined } from '@wm/core';

import { BaseComponent } from '../../base/base.component';
import { EDIT_MODE, getDataTableFilterWidget, getDefaultValue, getEditModeWidget, setHeaderConfigForTable } from '../../../../utils/live-utils';
import { registerProps } from './table-column.props';
import { getWatchIdentifier, isDataSetWidget, provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
import { TableColumnGroupDirective } from '../table-column-group/table-column-group.directive';
import { applyFilterOnField, fetchRelatedFieldData, getDistinctFieldProperties, getDistinctValues, getDistinctValuesForField } from '../../../../utils/data-utils';

declare const _;

const WIDGET_CONFIG = {widgetType: 'wm-table-column', hostClass: ''};

let inlineWidgetProps = ['datafield', 'displayfield', 'placeholder', 'searchkey', 'matchmode', 'displaylabel',
                            'checkedvalue', 'uncheckedvalue', 'showdropdownon', 'dataentrymode', 'dataset'];
const validationProps = ['maxchars', 'regexp', 'minvalue', 'maxvalue', 'required'];
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

    @ContentChildren('filterWidget') _filterInstances;
    @ContentChildren('inlineWidget') _inlineInstances;
    @ContentChildren('inlineWidgetNew') _inlineInstancesNew;
    @ContentChild('customExprTmpl') customExprTmpl;

    private _propsInitialized: boolean;
    private _filterDataSet;
    private _isRowFilter;
    private _isInlineEditable;
    private _isNewEditableRow;

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
    generator;
    limit;
    mobiledisplay;
    pcdisplay;
    readonly;
    required;
    maxchars;
    minvalue;
    maxvalue;
    regexp;
    searchable;
    show;
    sortable;
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
    private _dataoptions: any;
    private _datasource: any;
    private _debounceSetUpValidators;
    private _debounceSetUpValidatorsNew;

    @ContentChild('filterTmpl') filterTemplateRef: TemplateRef<any>;

    constructor(
        inj: Injector,
        private appDefaults: AppDefaults,
        @Optional() public table: TableComponent,
        @Optional() public group: TableColumnGroupDirective,
        @Attribute('filterdataset.bind') public bindfilterdataset,
        @Attribute('dataset.bind') public binddataset
    ) {
        super(inj, WIDGET_CONFIG);

        this._debounceSetUpValidators = debounce(this.setUpValidators.bind(this, 'inlineInstance'), 250);
        this._debounceSetUpValidatorsNew = debounce(this.setUpValidators.bind(this, 'inlineInstanceNew'), 250);
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

        // Register column with header config to create group structure
        setHeaderConfigForTable(this.table.headerConfig, {
            field: this.field,
            displayName: this.displayName
        }, this.group && this.group.name);

        this.table.registerColumns(this.widget);

        this._isRowFilter = this.table.filtermode === 'multicolumn' && this.searchable;
        this._isInlineEditable = !this.readonly && (this.table.editmode !== EDIT_MODE.DIALOG && this.table.editmode !== EDIT_MODE.FORM);
        this._isNewEditableRow = this._isInlineEditable && this.table.editmode === EDIT_MODE.QUICK_EDIT && this.table.shownewrow;
        this.setUpControls();

        this._propsInitialized = true;
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
                this.table.registerFormField(this.binding, new FieldDef(this.inlineInstance));
                this.setUpInlineWidget('inlineInstance');
            });
            this.registerDestroyListener(() => s2.unsubscribe());

            if (this._isNewEditableRow) {
                const s3 = this._inlineInstancesNew.changes.subscribe((val) => {
                    // Listen on the inner inline widget and setup the widget
                    this.inlineInstanceNew = val.first && val.first.widget;
                    this.setUpInlineWidget('inlineInstanceNew');
                });
                this.registerDestroyListener(() => s3.unsubscribe());
            }
        }
        super.ngAfterContentInit();
    }

    ngAfterViewInit() {
        // manually listing the table column templateRef as templateRef will not be available prior.
        if (this.filterTemplateRef) {
            this.table.renderDynamicFilterColumn(this.filterTemplateRef);
        }
    }

    addFormControl(suffix?: string) {
        const ctrlName = suffix ? (this.binding + suffix) : this.binding;
        this.table.ngform.addControl(ctrlName, this.table.fb.control(''));
    }

    getFormControl(suffix?: string) {
        const ctrlName = suffix ? (this.binding + suffix) : this.binding;
        return this.table.ngform.controls[ctrlName];
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
                const onValueChangeSubscription =  control.valueChanges.subscribe(this.onValueChange.bind(this));
                this.registerDestroyListener(() => onValueChangeSubscription.unsubscribe());
            }

            if (this._isNewEditableRow) {
                this.addFormControl('_new');
                const newControl = this.getFormControl('_new');
                if (newControl) {
                   const onNewValueChangeSubscription =  newControl.valueChanges.subscribe(this.onValueChange.bind(this));
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

    // On field value change, apply cascading filter
    onValueChange(val) {
        if (val !== null) {
            applyFilterOnField(this.table.datasource, this.widget, this.table.fieldDefs, val, {
                widget: 'edit-widget-type'
            });
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
                    this.widget['lookup-field'] = _.last(_.split(this.field, '.'));
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
                const bindings = _.split(this.binding, '.');
                fetchRelatedFieldData(dataSource, this.widget, {
                    relatedField: _.head(bindings),
                    datafield: _.last(bindings),
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
        this.loadInlineWidgetData();
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
                const field = _.last(this.binding.split('.'));
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

    // On change of any validation property, set the angular form validators
    setUpValidators(widget) {
        const control = this.getFormControl(widget === 'inlineInstanceNew' ? '_new' : undefined);
        if (!control) {
            return;
        }
        const validators = [];
        if (this.required) {
            // For checkbox/toggle widget, required validation should consider true value only
            if (this.editWidgetType === FormWidgetType.CHECKBOX || this.editWidgetType === FormWidgetType.TOGGLE) {
                validators.push(Validators.requiredTrue);
            } else {
                validators.push(Validators.required);
            }
        }
        if (this.maxchars) {
            validators.push(Validators.maxLength(this.maxchars));
        }
        if (this.minvalue) {
            validators.push(Validators.min(this.minvalue));
        }
        if (this.maxvalue) {
            validators.push(Validators.max(this.maxvalue));
        }
        if (this.regexp) {
            validators.push(Validators.pattern(this.regexp));
        }
        if (this[widget] && _.isFunction(this[widget].validate)) {
            validators.push(this[widget].validate.bind(this[widget]));
        }
        control.setValidators(validators);
        control.updateValueAndValidity();
    }

    // Set the props on the inline edit widget
    setInlineWidgetProp(widget, prop, nv) {
        if (prop === 'datepattern' && this.editWidgetType === FormWidgetType.TIME) {
            prop = 'timepattern';
        }
        if (this[widget] && isDefined(nv)) {
            this[widget][prop] = nv;
        }
        if (validationProps.includes(prop)) {
            this._debounceSetUpValidators();
            this._debounceSetUpValidatorsNew();
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
        this.limit =  this.limit ? +this.limit  :  undefined;
        this.editWidgetType = this['edit-widget-type'] =  this['edit-widget-type'] || getEditModeWidget(this);
        this.filterOn =  this['filter-on'];
        this.readonly =  isDefined(this.getAttr('readonly')) ? this.getAttr('readonly') === 'true' :  (this['related-entity-name'] ? !this['primary-key'] :  _.includes(['identity', 'uniqueid', 'sequence'], this.generator));
        this.filterwidget =  this.filterwidget || getDataTableFilterWidget(this.type || 'string');
        this.isFilterDataSetBound = !!this.bindfilterdataset;
        this.defaultvalue = getDefaultValue(this.defaultvalue, this.type, this.editWidgetType);

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
                break;
            case 'defaultvalue':
                this.defaultvalue = getDefaultValue(this.defaultvalue, this.type, this.editWidgetType);
                break;
            case 'show':
                this.table.redraw(true);
                break;
            case 'filterdataset':
                this._filterDataSet = nv;
                this.setFilterWidgetDataSet();
                break;
            case 'editdatepattern':
                this.setInlineWidgetProp('inlineInstance', 'datepattern', nv);
                this.setInlineWidgetProp('inlineInstanceNew', 'datepattern', nv);
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
