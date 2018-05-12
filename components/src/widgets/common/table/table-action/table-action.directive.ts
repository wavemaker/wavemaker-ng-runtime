import { Directive, Injector, OnInit, Optional } from '@angular/core';

import { TableRef } from '../../../framework/types';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './table-action.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';

declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-table-action', hostClass: ''};

@Directive({
    selector: '[wmTableAction]',
    providers: [
        provideAsWidgetRef(TableActionDirective)
    ]
})
export class TableActionDirective extends StylableComponent implements OnInit {
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

    constructor(inj: Injector, @Optional() public _tableParent: TableRef) {
        super(inj, WIDGET_CONFIG);
    }

    populateAction() {
        this.buttonDef = {
            key: this.key,
            displayName: this['display-name'] || this.caption || '',
            show: this.show || 'false',
            class: this.class || '',
            iconclass: this.iconclass || '',
            title: _.isUndefined(this.title) ? (this['display-name'] || '') : this.title,
            action: this.action,
            accessroles: this.accessroles,
            shortcutkey: this.shortcutkey,
            disabled: this.disabled || 'false',
            tabindex: this.tabindex ? +this.tabindex : undefined,
            icon: this.icon,
            position: this.position || 'footer'
        };
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateAction();
        (this._tableParent as any).registerActions(this.buttonDef);
    }
}
