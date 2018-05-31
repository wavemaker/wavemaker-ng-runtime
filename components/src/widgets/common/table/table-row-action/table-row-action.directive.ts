import { Directive, Injector, OnInit, Optional } from '@angular/core';

import { BaseComponent } from '../../base/base.component';
import { registerProps } from './table-row-action.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';

declare const _;

registerProps();
const WIDGET_CONFIG = {widgetType: 'wm-table-row-action', hostClass: ''};

@Directive({
    selector: '[wmTableRowAction]',
    providers: [
        provideAsWidgetRef(TableRowActionDirective)
    ]
})
export class TableRowActionDirective extends BaseComponent implements OnInit {
    accessroles;
    action;
    caption;
    class;
    disabled;
    displayName;
    iconclass;
    key;
    show;
    tabindex;
    title;

    public buttonDef;

    constructor(
        inj: Injector,
        @Optional() public table: TableComponent,
    ) {
        super(inj, WIDGET_CONFIG);
    }

    populateAction() {
        this.buttonDef = {
            key: this.key,
            displayName: this.displayName || this.caption || '',
            show: this.show,
            class: this.class || '',
            iconclass: this.iconclass || '',
            title: _.isUndefined(this.title) ? (this.displayName || '') : this.title,
            action: this.action,
            accessroles: this.accessroles,
            disabled: this.disabled,
            tabindex: this.tabindex ? +this.tabindex : undefined
        };
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateAction();
        this.table.registerRowActions(this.buttonDef);
    }
}
