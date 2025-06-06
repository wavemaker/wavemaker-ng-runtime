import {Directive, Inject, Injector, OnInit, Optional} from '@angular/core';

import { BaseComponent, provideAsWidgetRef } from '@wm/components/base';

import { registerProps } from './table-action.props';
import { TableComponent } from '../table.component';
import {isUndefined} from "lodash-es";

const WIDGET_CONFIG = {widgetType: 'wm-table-action', hostClass: ''};

@Directive({
  standalone: true,
    selector: '[wmTableAction]',
    providers: [
        provideAsWidgetRef(TableActionDirective)
    ]
})
export class TableActionDirective extends BaseComponent implements OnInit {
    static initializeProps = registerProps();

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
    hyperlink;
    target;
    buttonDef;
    conditionalclass;
    conditionalstyle;

    private _propsInitialized: boolean;

    constructor(inj: Injector, @Optional() public table: TableComponent, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
    }

    populateAction() {
        this.buttonDef = {
            key: this.key,
            displayName: this['display-name'] || this.caption || '',
            show: this.show,
            class: this.class || '',
            iconclass: this.iconclass || '',
            title: isUndefined(this.title) ? (this['display-name'] || '') : this.title,
            action: this.action,
            accessroles: this.accessroles,
            shortcutkey: this.shortcutkey,
            disabled: this.disabled,
            tabindex: this.tabindex,
            icon: this.icon,
            position: this.position,
            widgetType: this['widget-type'],
            hyperlink: this.hyperlink,
            target: this.target || '',
            conditionalclass: this.conditionalclass || '',
            conditionalstyle: this.conditionalstyle || {}
        };
        this._propsInitialized = true;
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateAction();
        this.table.registerActions(this.buttonDef);
    }

    onPropertyChange(key, nv) {
        if (!this._propsInitialized) {
            return;
        }

        if (key === 'display-name') {
            this.buttonDef.displayName = nv;
        } else {
            this.buttonDef[key] = nv;
        }
    }
}
