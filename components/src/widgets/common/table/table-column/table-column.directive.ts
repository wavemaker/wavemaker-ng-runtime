import { Directive, Injector, OnInit, Optional, ContentChildren, Attribute, AfterContentInit } from '@angular/core';

import { BaseComponent } from '../../base/base.component';
import { getDataTableFilterWidget, setHeaderConfigForTable } from '../../../../utils/live-utils';
import { registerProps } from './table-column.props';
import { getWatchIdentifier, isDataSetWidget, provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
import { TableColumnGroupDirective } from '../table-column-group/table-column-group.directive';
import { $watch, DataSource, FormWidgetType } from '@wm/core';
import { getDistinctValues } from '../../../../utils/data-utils';

declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-table-column', hostClass: ''};

const COLUMN_PROPS = ['generator', 'widgetType', 'datepattern', 'currencypattern', 'fractionsize', 'suffix', 'prefix', 'accessroles', 'dataset', 'datafield',
    'placeholder', 'displaylabel', 'searchkey', 'displayfield', 'rowactionsposition', 'filterplaceholder', 'relatedEntityName', 'checkedvalue', 'uncheckedvalue',
    'filterOn', 'filterdataset', 'filterdatafield', 'filterdisplayfield', 'filterdisplaylabel', 'filtersearchkey', 'filteronfilter', 'editdatepattern',
    'width', 'type', 'filterwidget', 'defaultvalue', 'disabled', 'required', 'sortable', 'show'];

@Directive({
    selector: '[wmTableColumn]',
    providers: [
        provideAsWidgetRef(TableColumnDirective)
    ]
})
export class TableColumnDirective extends BaseComponent implements OnInit, AfterContentInit {

    @ContentChildren('filterWidget') _filterWidget;

    filterWidget;

    backgroundcolor;
    binding;
    caption;
    colClass;
    colNgClass;
    defaultvalue;
    disabled;
    editWidgetType;
    filterwidget;
    formatpattern;
    generator;
    limit;
    mobiledisplay;
    pcdisplay;
    primaryKey;
    readonly;
    relatedEntityName;
    required;
    searchable;
    show;
    sortable;
    textalignment;
    textcolor;
    type;
    width;
    filterdatafield;
    filterdisplayfield;
    filterdisplaylabel;
    filtersearchkey;
    filterplaceholder;
    fieldDef: any = {};

    private IsPropsInitialized;
    private _filterDataSet;
    private _isRowFilter;

    constructor(
        inj: Injector,
        @Optional() public table: TableComponent,
        @Optional() public group: TableColumnGroupDirective,
        @Attribute('filterdataset.bind') public bindfilterdataset
    ) {
        super(inj, WIDGET_CONFIG);
    }

    ngOnInit() {
        super.ngOnInit();

        this._isRowFilter = this.table.filtermode === 'multicolumn';

        this.populateFieldDef();
        this.table.registerColumns(this.fieldDef);

        // Register column with header config to create group structure
        setHeaderConfigForTable(this.table.headerConfig, {
            field: this.fieldDef.field,
            displayName: this.fieldDef.displayName
        }, this.group && this.group.name);

        this.IsPropsInitialized = true;

    }

    initializeFilter() {
        // If filterdataset is not bound, get the data implicitly
        if (isDataSetWidget(this.filterwidget) && !this.bindfilterdataset) {
            // For live variable, get the data using distinct API
            if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_DISTINCT_API)) {
                getDistinctValues(this.table.datasource, this.fieldDef, 'filterwidget').then((res: any) => {
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

    // On table datasource change, get the data for row filters
    onDataSourceChange() {
        if (this._isRowFilter) {
            this.initializeFilter();
        }
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
            this.filterWidget.dataset = this._filterDataSet;
            this.filterWidget.datafield = this.filterdatafield || this.binding;
            this.filterWidget.displayfield = this.filterdisplayfield || this.binding;
            if (this.filterwidget === FormWidgetType.AUTOCOMPLETE) {
                this.filterWidget.displaylabel = this.filterdisplaylabel || this.binding;
                this.filterWidget.searchkey = this.filtersearchkey || this.binding;
            }
            if (this.filterwidget === FormWidgetType.TIME) {
                this.filterWidget.timepattern = 'hh:mm:ss a'; // TODO: Set application time format
            }
            this.filterWidget.placeholder = this.filterplaceholder || '';
        });
    }

    ngAfterContentInit() {
        if (this._isRowFilter) {
            // Listen on the inner row filter widget and setup the widget
            this.registerDestroyListener(this._filterWidget.changes.subscribe((val) => {
                this.filterWidget = val.first && val.first.widget;
                this.setUpFilterWidget();
            }));
        }
    }

    getStyleDef() {
        return `{width: ${this.width || ''}; background-color: ${this.backgroundcolor || ''}; color: ${this.textcolor || ''}};`;
    }

    populateFieldDef() {
        this.width = this.width === 'px' ?  '' : (this.width || '');

        this.fieldDef = {
            field: this.binding,
            displayName: this.caption || '',
            pcDisplay: this.pcdisplay,
            mobileDisplay: this.mobiledisplay,
            textAlignment: this.textalignment,
            backgroundColor: this.backgroundcolor,
            textColor: this.textcolor,
            primaryKey: this['primary-key'],
            style: this.getStyleDef(),
            class: this['col-class'],
            ngclass: this['col-ng-class'],
            formatpattern: this.formatpattern === 'toNumber' ? 'numberToString' : this.formatpattern,
            searchable: (this.type === 'blob' || this.type === 'clob') ? false : this.searchable,
            limit: this.limit ? +this.limit : undefined,
            editWidgetType: this['edit-widget-type'],
            readonly: !_.isUndefined(this.readonly) ? this.readonly === 'true' : this.relatedEntityName ? !this.primaryKey : _.includes(['identity', 'uniqueid', 'sequence'], this.generator),
            filterwidget: this.filterwidget || getDataTableFilterWidget(this.type || 'string'),
            onDataSourceChange: this.onDataSourceChange.bind(this)
        };
        this.fieldDef._isFilterDataSetBound = !!this.bindfilterdataset;
        this.fieldDef._widget = this.widget;

        COLUMN_PROPS.forEach(prop => {
            this.fieldDef[prop] = this[prop];
        });
    }

    onPropertyChange(key, nv) {
        if (!this.IsPropsInitialized) {
            return;
        }
        switch (key) {
            case 'caption':
                this.fieldDef.displayName = nv || '';
                this.table.callDataGridMethod('setColumnProp', this.binding, 'displayName', nv);
                break;
            case 'show':
                this.fieldDef.show = nv;
                this.table.redraw(true);
                break;
            case 'filterdataset':
                this._filterDataSet = nv;
                this.setFilterWidgetDataSet();
                break;
        }
    }
}
