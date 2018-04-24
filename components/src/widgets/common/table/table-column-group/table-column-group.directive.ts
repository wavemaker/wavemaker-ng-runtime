import { Directive, forwardRef, Injector, OnInit, Optional, SkipSelf } from '@angular/core';

import { TableColumnGroupRef, TableRef, WidgetRef } from '../../../framework/types';
import { BaseComponent } from '../../base/base.component';
import { setHeaderConfigForTable } from '../../../../utils/live-utils';
import { registerProps } from './table-column-group.props';

registerProps();
const WIDGET_CONFIG = {widgetType: 'wm-table-column-group', hostClass: ''};

@Directive({
    selector: '[wmTableColumnGroup]',
    providers: [
        {provide: TableColumnGroupRef, useExisting: forwardRef(() => TableColumnGroupDirective)},
        {provide: WidgetRef, useExisting: forwardRef(() => TableColumnGroupDirective)}
    ]
})
export class TableColumnGroupDirective extends BaseComponent implements OnInit {

    accessroles;
    backgroundcolor;
    caption;
    colClass;
    name;
    textalignment;

    public config;

    constructor(
        inj: Injector,
        @SkipSelf() @Optional() public _groupParent: TableColumnGroupRef,
        @Optional() public _tableParent: TableRef
    ) {
        super(inj, WIDGET_CONFIG);
    }

    populateConfig() {
        this.config = {
            field: this.name,
            displayName: this.caption,
            columns: [],
            isGroup: true,
            accessroles: this.accessroles,
            textAlignment: this.textalignment || 'center',
            backgroundColor: this.backgroundcolor,
            class: this.colClass
        };
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateConfig();
        setHeaderConfigForTable((this._tableParent as any).headerConfig, this.config, this._groupParent && (this._groupParent as any).name);
    }
}
