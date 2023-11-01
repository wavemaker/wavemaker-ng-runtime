import { Directive, Inject, Injector, OnInit, Optional, Self } from '@angular/core';

import { BaseComponent, Context, provideAsWidgetRef } from '@wm/components/base';

import { registerProps } from './table-row-action.props';
import { TableComponent } from '../table.component';

declare const _;

const WIDGET_CONFIG = {widgetType: 'wm-table-row-action', hostClass: ''};

@Directive({
    selector: '[wmTableRowAction]',
    providers: [
        provideAsWidgetRef(TableRowActionDirective),
        {provide: Context, useFactory: () => { return {} }, multi: true}
    ]
})
export class TableRowActionDirective extends BaseComponent implements OnInit {
    static initializeProps = registerProps();

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
    buttonDef;
    hyperlink;
    target;
    conditionalclass;
    conditionalstyle;

    constructor(
        inj: Injector,
        @Optional() public table: TableComponent,
        @Self() @Inject(Context) contexts: Array<any>
    ) {
        super(inj, WIDGET_CONFIG);

        contexts[0].editRow = (evt) => this.table.editRow(evt);
        contexts[0].deleteRow = (evt) => this.table.deleteRow(evt);
        contexts[0].addNewRow = (evt) => this.table.addNewRow(evt);
    }

    getTitle() {
        return _.isUndefined(this.title) ? (this['display-name'] || '') : this.title;
    }

    populateAction() {
        this.buttonDef = {
            key: this.key,
            displayName: this['display-name'] || this.caption || '',
            show: this.show,
            class: this.class || '',
            iconclass: this.iconclass || '',
            title: this.getTitle(),
            action: this.action,
            accessroles: this.accessroles,
            disabled: this.disabled,
            tabindex: this.tabindex ? +this.tabindex : undefined,
            widgetType: this['widget-type'] || 'button',
            hyperlink: this.hyperlink,
            target: this.target || '',
            conditionalclass: this.conditionalclass || '',
            conditionalstyle: this.conditionalstyle || {}
        };
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateAction();
        this.table.registerRowActions(this.buttonDef);
    }
}
