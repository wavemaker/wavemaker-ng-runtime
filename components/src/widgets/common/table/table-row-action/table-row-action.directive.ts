import { Directive, Injector, OnInit, Optional, Inject, Self } from '@angular/core';

import { BaseComponent } from '../../base/base.component';
import { registerProps } from './table-row-action.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
import { Context } from '../../../framework/types';

declare const _;

registerProps();
const WIDGET_CONFIG = {widgetType: 'wm-table-row-action', hostClass: ''};

@Directive({
    selector: '[wmTableRowAction]',
    providers: [
        provideAsWidgetRef(TableRowActionDirective),
        {provide: Context, useValue: {}, multi: true}
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
    buttonDef;

    constructor(
        inj: Injector,
        @Optional() public table: TableComponent,
        @Self() @Inject(Context) contexts: Array<any>
    ) {
        super(inj, WIDGET_CONFIG);

        contexts[0].editRow = (evt) => this.table.editRow(evt);
        contexts[0].deleteRow = (evt) => this.table.deleteRow(evt);
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
            tabindex: this.tabindex ? +this.tabindex : undefined
        };
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateAction();
        this.table.registerRowActions(this.buttonDef);
    }
}
