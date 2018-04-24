import { Directive, forwardRef, Injector, OnInit, Optional } from '@angular/core';

import { TableRef, WidgetRef } from '../../../framework/types';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './table-row-action.props';

declare const _;

registerProps();
const WIDGET_CONFIG = {widgetType: 'wm-table-row-action', hostClass: ''};

@Directive({
    selector: '[wmTableRowAction]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => TableRowActionDirective)}
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
        @Optional() public _tableParent: TableRef,
    ) {
        super(inj, WIDGET_CONFIG);
    }

    populateAction() {
        this.buttonDef = {
            key: this.key,
            displayName: this.displayName || this.caption || '',
            show: this.show || 'false',
            class: this.class || '',
            iconclass: this.iconclass || '',
            title: _.isUndefined(this.title) ? (this.displayName || '') : this.title,
            action: this.action,
            accessroles: this.accessroles,
            disabled: this.disabled || 'false',
            tabindex: this.tabindex ? +this.tabindex : undefined
        };
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateAction();
        (this._tableParent as any).registerRowActions(this.buttonDef);
    }
}
