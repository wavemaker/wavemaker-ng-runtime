import { Directive, Optional, ElementRef, Injector, ChangeDetectorRef } from '@angular/core';
import { TableParent } from '../parent';
import { registerProps } from './table-row-action.props';
import { BaseComponent } from '../../base/base.component';

declare const _;

registerProps();
const WIDGET_CONFIG = {widgetType: 'wm-table-row-action', hostClass: ''};

@Directive({
    selector: '[wmTableRowAction]'
})
export class TableRowActionDirective extends BaseComponent {
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

    constructor(@Optional() public _tableParent: TableParent,
                inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
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

    _ngOnInit() {
        this.populateAction();
        this._tableParent.registerRowActions(this.buttonDef);
    }

}
