import { Component, Optional, ElementRef, Injector, ChangeDetectorRef } from '@angular/core';
import { TableParent } from './parent';
import { registerProps } from './table-action.props';
import { BaseComponent } from '../base/base.component';
declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-table-action', hasTemplate: true};

@Component({
    selector: 'wm-table-action',
    template: '<div><div>'
})
export class TableActionComponent extends BaseComponent {
    accessroles;
    action;
    caption;
    class;
    disabled;
    displayName;
    icon;
    iconclass;
    position;
    shortcutkey;
    show;
    tabindex;
    title;
    key;

    public buttonDef;

    constructor(@Optional() public _tableParent: TableParent, inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    populateAction() {
        this.buttonDef = {
            'key': this.key,
            'displayName': this.displayName || this.caption || '',
            'show': this.show || 'false',
            'class': this.class || '',
            'iconclass': this.iconclass || '',
            'title': _.isUndefined(this.title) ? (this.displayName || '') : this.title,
            'action': this.action,
            'accessroles': this.accessroles,
            'shortcutkey': this.shortcutkey,
            'disabled': this.disabled || 'false',
            'tabindex': this.tabindex ? +this.tabindex : undefined,
            'icon': this.icon,
            'position': this.position || 'footer'
        };
    }

    _ngOnInit() {
        this.populateAction();
        this._tableParent.registerActions(this.buttonDef);
    }

}
