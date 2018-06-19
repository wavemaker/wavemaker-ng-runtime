import { Directive, Injector, OnInit, Optional, SkipSelf } from '@angular/core';

import { BaseComponent } from '../../base/base.component';
import { setHeaderConfigForTable } from '../../../../utils/live-utils';
import { registerProps } from './table-column-group.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';

registerProps();
const WIDGET_CONFIG = {widgetType: 'wm-table-column-group', hostClass: ''};

@Directive({
    selector: '[wmTableColumnGroup]',
    providers: [
        provideAsWidgetRef(TableColumnGroupDirective)
    ]
})
export class TableColumnGroupDirective extends BaseComponent implements OnInit {

    accessroles;
    backgroundcolor;
    caption;
    colClass;
    name;
    textalignment;
    config: any = {};

    constructor(
        inj: Injector,
        @SkipSelf() @Optional() public group: TableColumnGroupDirective,
        @Optional() public table: TableComponent
    ) {
        super(inj, WIDGET_CONFIG);
    }

    populateConfig() {
        this.config = {
            field: this.name,
            displayName: this.caption || '',
            columns: [],
            isGroup: true,
            accessroles: this.accessroles,
            textAlignment: this.textalignment || 'center',
            backgroundColor: this.backgroundcolor,
            class: this['col-class']
        };
    }

    onPropertyChange(key, nv, ov?) {
        if (key === 'caption') {
            this.config.displayName = nv || '';
            this.table.callDataGridMethod('setColumnProp', this.config.field, 'displayName', nv, true);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateConfig();
        setHeaderConfigForTable(this.table.headerConfig, this.config, this.group && this.group.name);
    }
}
