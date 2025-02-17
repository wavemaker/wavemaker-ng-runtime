import {Directive, Inject, Injector, OnInit, Optional, SkipSelf} from '@angular/core';

import { BaseComponent, provideAsWidgetRef } from '@wm/components/base';

import { registerProps } from './table-row.props';
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
    expandtitle;
    collapseicon;
    collapsetitle;
    height;
    position;

    constructor(
        inj: Injector,
        @Optional() @SkipSelf() public table: TableComponent, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
    }

    populateConfig() {
        this.config = {
            closeothers: this.closeothers,
            content: this.content,
            columnwidth: this.columnwidth,
            expandicon: this.expandicon,
            expandtitle: this.expandtitle,
            collapsetitle: this.collapsetitle,
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
