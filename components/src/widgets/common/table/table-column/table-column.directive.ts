import { Directive, Injector, OnInit, Optional } from '@angular/core';

import { BaseComponent } from '../../base/base.component';
import { TableGroupParent, TableParent } from '../parent';
import { setHeaderConfigForTable } from '../../../../utils/live-utils';
import { registerProps } from './table-column.props';

declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-table-column', hostClass: ''};

@Directive({
    selector: '[wmTableColumn]'
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

    public fieldDef;

    constructor(
        inj: Injector,
        @Optional() public _tableParent: TableParent,
        @Optional() public _groupParent: TableGroupParent,
    ) {
        super(inj, WIDGET_CONFIG);
    }

    getStyleDef() {
        return `{width: ${this.width}; background-color: ${this.backgroundcolor}; color: ${this.textcolor}};`
    }
    populateFieldDef() {
        this.fieldDef = {
            field: this.binding,
            displayName: this.caption,
            pcDisplay: !_.isUndefined(this.pcdisplay) ? this.pcdisplay === 'true' : true,
            mobileDisplay: !_.isUndefined(this.mobiledisplay) ? this.mobiledisplay === 'true' : true,
            width: this.width === 'px' ?  '' : (this.width || ''),
            textAlignment: this.textalignment || 'left',
            backgroundColor: this.backgroundcolor,
            textColor: this.textcolor,
            type: this.type || 'string',
            primaryKey: this.primaryKey,
            style: this.getStyleDef(),
            class: this.colClass,
            ngclass: this.colNgClass,
            formatpattern: this.formatpattern === 'toNumber' ? 'numberToString' : this.formatpattern,
            disabled: !this.disabled ? false : (this.disabled === 'true' || this.disabled),
            required: this.required ? false : (this.required === 'true' || this.required),
            sortable: this.sortable !== 'false',
            searchable: (this.type === 'blob' || this.type === 'clob') ? false : this.searchable !== 'false',
            show: this.show === 'false' ? false : (this.show === 'true' || !this.show || this.show),
            limit: this.limit ? +this.limit : undefined,
            filterwidget: this.filterwidget,
            generator: this.generator,
            defaultvalue: this.defaultvalue,
            editWidgetType: this.editWidgetType,
            readonly: !_.isUndefined(this.readonly) ? this.readonly === 'true' : this.relatedEntityName ? !this.primaryKey : _.includes(['identity', 'uniqueid', 'sequence'], this.generator),
        };
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateFieldDef();
        this._tableParent.registerColumns(this.fieldDef);
        setHeaderConfigForTable(this._tableParent.headerConfig, {
            field: this.fieldDef.field,
            displayName: this.fieldDef.displayName
        }, this._groupParent && this._groupParent.name);
    }
}
