import { Directive, Injector, OnInit, Optional } from '@angular/core';

import { registerProps } from './form-action.props';
import { StylableComponent } from '../../base/stylable.component';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { FormComponent } from '../form.component';

declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-form-action', hostClass: ''};

@Directive({
    selector: '[wmFormAction]',
    providers: [
        provideAsWidgetRef(FormActionDirective)
    ]
})
export class FormActionDirective extends StylableComponent implements OnInit {
    accessroles;
    action;
    binding;
    class;
    disabled;
    displayName;
    iconclass;
    iconname;
    key;
    position;
    shortcutkey;
    show;
    tabindex;
    title;
    type;
    updateMode;

    public buttonDef;

    constructor(inj: Injector, @Optional() public form: FormComponent) {
        super(inj, WIDGET_CONFIG);
    }

    populateAction() {
        this.buttonDef = {
            key: this.key || this.binding,
            displayName: this['display-name'],
            show: this.show || 'false',
            class: this.class || '',
            iconclass: this.iconclass || '',
            title: _.isUndefined(this.title) ? (this['display-name'] || '') : this.title,
            action: this.action,
            accessroles: this.accessroles,
            shortcutkey: this.shortcutkey,
            disabled: this.disabled || 'false',
            tabindex: this.tabindex ? +this.tabindex : undefined,
            iconname: this.iconname,
            type: this.type || 'button',
            updateMode: this['update-mode'] === true || this['update-mode'] === 'true',
            position: this.position || 'footer'
        };
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateAction();
        this.form.registerActions(this.buttonDef);
    }
}
