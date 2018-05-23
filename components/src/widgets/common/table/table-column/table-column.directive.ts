import { Directive, Injector, OnInit, Optional } from '@angular/core';

import { BaseComponent } from '../../base/base.component';
import { setHeaderConfigForTable } from '../../../../utils/live-utils';
import { registerProps } from './table-column.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
import { TableColumnGroupDirective } from '../table-column-group/table-column-group.directive';

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
export class TableColumnDirective extends BaseComponent implements OnInit {

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
    fieldDef: any = {};

    private IsPropsInitialized;

    constructor(
        inj: Injector,
        @Optional() public table: TableComponent,
        @Optional() public group: TableColumnGroupDirective,
    ) {
        super(inj, WIDGET_CONFIG);
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
        };

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
        }
    }

    ngOnInit() {
        super.ngOnInit();

        this.populateFieldDef();
        this.table.registerColumns(this.fieldDef);

        setHeaderConfigForTable(this.table.headerConfig, {
            field: this.fieldDef.field,
            displayName: this.fieldDef.displayName
        }, this.group && this.group.name);

        this.IsPropsInitialized = true;
    }
}
