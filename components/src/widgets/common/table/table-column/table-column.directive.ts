import { Directive, Injector, OnInit, Optional, ContentChildren, Attribute, AfterContentInit } from '@angular/core';

import { BaseComponent } from '../../base/base.component';
import { getDataTableFilterWidget, setHeaderConfigForTable, getEditModeWidget, getDefaultValue, EDIT_MODE } from '../../../../utils/live-utils';
import { registerProps } from './table-column.props';
import { getWatchIdentifier, isDataSetWidget, provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
import { TableColumnGroupDirective } from '../table-column-group/table-column-group.directive';
import { $watch, DataSource, FormWidgetType, isDefined } from '@wm/core';
import { applyFilterOnField, fetchRelatedFieldData, getDistinctValues, getDistinctValuesForField } from '../../../../utils/data-utils';

declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-table-column', hostClass: ''};

const inlineWidgetProps = ['datafield', 'displayfield', 'disabled', 'required', 'placeholder', 'searchkey', 'displaylabel',
                            'checkedvalue', 'uncheckedvalue', 'showdropdownon', 'dataset'];

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
export class TableColumnDirective extends BaseComponent implements OnInit, AfterContentInit {

    @ContentChildren('filterWidget') _filterWidget;
    @ContentChildren('inlineWidget') _inlineWidget;
    @ContentChildren('inlineWidgetNew') _inlineWidgetNew;

    private _propsInitialized: boolean;
    private _filterDataSet;
    private _isRowFilter;
    private _isInlineEditable;
    private _isNewEditableRow;

    filterWidget;
    inlineWidget;
    inlineWidgetNew;

    backgroundcolor;
    binding;
    caption;
    dataset;
    defaultvalue;
    disabled;
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
    searchable;
    show;
    sortable;
    textalignment;
    textcolor;
    type;
    width;
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

    constructor(
        inj: Injector,
        @Optional() public table: TableComponent,
        @Optional() public group: TableColumnGroupDirective,
        @Attribute('filterdataset.bind') public bindfilterdataset,
        @Attribute('dataset.bind') public binddataset
    ) {
        super(inj, WIDGET_CONFIG);
    }

    ngOnInit() {
        super.ngOnInit();

        // Set the default values and register with table
        this.populateFieldDef();
        this.table.registerColumns(this.widget);

        this._isRowFilter = this.table.filtermode === 'multicolumn' && this.searchable;
        this._isInlineEditable = !this.readonly && (this.table.editmode !== EDIT_MODE.DIALOG && this.table.editmode !== EDIT_MODE.FORM);
        this._isNewEditableRow = this._isInlineEditable && this.table.editmode === EDIT_MODE.QUICK_EDIT && this.table.shownewrow;
        this.setUpControls();

        // Register column with header config to create group structure
        setHeaderConfigForTable(this.table.headerConfig, {
            field: this.field,
            displayName: this.displayName
        }, this.group && this.group.name);

        this._propsInitialized = true;

    }

    ngAfterContentInit() {
        if (this._isRowFilter) {
            // Listen on the inner row filter widget and setup the widget
            this.registerDestroyListener(this._filterWidget.changes.subscribe((val) => {
                this.filterWidget = val.first && val.first.widget;
                this.setUpFilterWidget();
            }));
        }

        if (this._isInlineEditable) {
            this.registerDestroyListener(this._inlineWidget.changes.subscribe((val) => {
                // Listen on the inner inline widget and setup the widget
                this.inlineWidget = val.first && val.first.widget;
                this.table.registerFormField(this.binding, new FieldDef(this.inlineWidget));
                this.setUpInlineWidget('inlineWidget');
            }));

            if (this._isNewEditableRow) {
                this.registerDestroyListener(this._inlineWidgetNew.changes.subscribe((val) => {
                    // Listen on the inner inline widget and setup the widget
                    this.inlineWidgetNew = val.first && val.first.widget;
                    this.setUpInlineWidget('inlineWidgetNew');
                }));
            }
        }
    }

    addFormControl(name) {
        this.table.ngform.addControl(name, this.table.fb.control(''));
    }

    getFormControl(name) {
        return this.table.ngform.controls[name];
    }

    // Setup the inline edit and filter widget
    setUpControls() {
        if (this._isInlineEditable) {
            if (this.editWidgetType === FormWidgetType.UPLOAD) {
                return;
            }
            this.addFormControl(this.binding);
            const control = this.getFormControl(this.binding);
            if (control) {
                control.valueChanges.subscribe(this.onValueChange.bind(this));
            }

            if (this._isNewEditableRow) {
                const ctrlName = this.binding + '_new';
                this.addFormControl(ctrlName);
                const newControl = this.getFormControl(ctrlName);
                if (newControl) {
                    newControl.valueChanges.subscribe(this.onValueChange.bind(this));
                }
            }
        }

        if (this._isRowFilter) {
            const filterName = this.binding + '_filter';
            this.addFormControl(filterName);
            this.filterControl = this.getFormControl(filterName);
            if (this.filterControl) {
                this.filterControl.valueChanges.subscribe(this.onFilterValueChange.bind(this));
            }
        }
    }

    // Reset the row filter value
    resetFilter() {
        if (this.filterControl) {
            this.filterControl.setValue('');
        }
    }

    // On field value change, propagate event to parent form
    onFilterValueChange(val) {
        this.table.rowFilter[this.field].value = val;
    }

    // On field value change, apply cascading filter
    onValueChange(val) {
        if (val !== null) {
            applyFilterOnField(this.table.datasource, this.widget, this.table.fieldDefs, val);
        }
    }

    initializeFilter() {
        // If filterdataset is not bound, get the data implicitly
        if (this._isRowFilter && isDataSetWidget(this.filterwidget) && !this.bindfilterdataset) {
            // For live variable, get the data using distinct API
            if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_DISTINCT_API)) {
                getDistinctValues(this.table.datasource, this.widget, 'filterwidget').then((res: any) => {
                    this._filterDataSet = _.pull(_.map(res.data.content, res.aliasColumn), null);
                    this.setFilterWidgetDataSet();
                });
            } else {
                // For other datasources, get the data from datasource bound to table
                this.registerDestroyListener($watch(this.table.binddataset, this.viewParent, {},
                        nv => this.widget.filterdataset = nv, getWatchIdentifier(this.widgetId, 'filterdataset')));
            }
        }
    }

    initializeInlineWidget() {
        // If dataset is not bound, get the data implicitly
        if (isDataSetWidget(this['edit-widget-type']) && !this.binddataset && !this.readonly) {
            const dataSource = this.table.datasource;
            if (this['related-entity-name'] && this['primary-key']) {
                // Fetch the data for the related fields
                this.isDataSetBound = true;
                const bindings = _.split(this.binding, '.');
                fetchRelatedFieldData(dataSource, this.widget, {
                    relatedField: _.head(bindings),
                    datafield: _.last(bindings)
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
        this.initializeFilter();
        this.initializeInlineWidget();
    }

    // Set the data on the row filter widget
    setFilterWidgetDataSet() {
        if (this.filterWidget) {
            this.filterWidget.dataset = this._filterDataSet;
        }
    }

    // Set the props on the row filter widget
    setUpFilterWidget() {
        this.filterWidget.registerReadyStateListener(() => {
            if (isDataSetWidget(this.filterwidget)) {
                this.filterWidget.dataset = this._filterDataSet;
                this.filterWidget.datafield = this.filterdatafield || this.binding;
                this.filterWidget.displayfield = this.filterdisplayfield || this.binding;
                if (this.filterwidget === FormWidgetType.AUTOCOMPLETE) {
                    this.filterWidget.displaylabel = this.filterdisplaylabel || this.binding;
                    this.filterWidget.searchkey = this.filtersearchkey || this.binding;
                }
            }
            if (this.filterwidget === FormWidgetType.TIME) {
                this.filterWidget.timepattern = 'hh:mm:ss a'; // TODO: Set application time format
            }
            this.filterWidget.placeholder = this.filterplaceholder || '';
        });
    }

    // Set the props on the inline edit widget
    setInlineWidgetProp(widget, prop, nv) {
        if (this[widget]) {
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
        this.readonly =  isDefined(this.readonly) ? this.readonly  :  (this['related-entity-name'] ? !this['primary-key'] :  _.includes(['identity', 'uniqueid', 'sequence'], this.generator));
        this.filterwidget =  this.filterwidget || getDataTableFilterWidget(this.type || 'string');
        this.isFilterDataSetBound = !!this.bindfilterdataset;
        this.defaultvalue = getDefaultValue(this.defaultvalue, this.type, this.editWidgetType);
    }

    onPropertyChange(key, nv) {
        if (!this._propsInitialized) {
            return;
        }
        switch (key) {
            case 'caption':
                this.displayName = nv || '';
                this.table.callDataGridMethod('setColumnProp', this.binding, 'displayName', nv);
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
                this.setInlineWidgetProp('inlineWidget', 'datepattern', nv);
                this.setInlineWidgetProp('inlineWidgetNew', 'datepattern', nv);
                break;
            default:
                if (inlineWidgetProps.includes(key)) {
                    this.setInlineWidgetProp('inlineWidget', key, nv);
                    this.setInlineWidgetProp('inlineWidgetNew', key, nv);
                }
                break;
        }
    }

    setProperty(property, nv) {
        this[property] = nv;
        if (property === 'displayName') {
            this.table.callDataGridMethod('setColumnProp', this.field, property, nv);
        } else {
            this.table.redraw(true);
        }
    }
}
