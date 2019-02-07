import { Directive, Injector, OnInit, Optional, SkipSelf } from '@angular/core';

import { BaseComponent } from '../../base/base.component';
import { registerProps } from './table-row.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';

const WIDGET_CONFIG = {widgetType: 'wm-table-row', hostClass: ''};

@Directive({
    selector: '[wmTableRow]',
    providers: [
        provideAsWidgetRef(TableRowDirective)
    ]
})
export class TableRowDirective extends BaseComponent implements OnInit {
    static initializeProps = registerProps();

    config;
    columnwidth;
    closeothers;
    content;
    expandicon;
    collapseicon;
    height;
    position;

    constructor(
        inj: Injector,
        @Optional() @SkipSelf() public table: TableComponent
    ) {
        super(inj, WIDGET_CONFIG);
    }

    populateConfig() {
        this.config = {
            closeothers: this.closeothers,
            content: this.content,
            columnwidth: this.columnwidth,
            expandicon: this.expandicon,
            collapseicon: this.collapseicon,
            height: this.height,
            position: this.position
        };
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateConfig();
        this.table.registerRow(this.config, this);
    }

    onPropertyChange(key: string, nv: any) {
        if (key === 'content' && this.config) {
            this.config.content = this.content;
        }
    }
}
