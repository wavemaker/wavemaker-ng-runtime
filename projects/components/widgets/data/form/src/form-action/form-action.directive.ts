import { Directive, Injector, OnInit, Optional } from '@angular/core';

import { BaseComponent, provideAsWidgetRef } from '@wm/components/base';

import { registerProps } from './form-action.props';
import { FormComponent } from '../form.component';

declare const _;

const WIDGET_CONFIG = {widgetType: 'wm-form-action', hostClass: ''};

@Directive({
    selector: '[wmFormAction]',
    providers: [
        provideAsWidgetRef(FormActionDirective)
    ]
})
export class FormActionDirective extends BaseComponent implements OnInit {
    static initializeProps = registerProps();

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
    buttonDef;
    hyperlink;
    target;

    private _propsInitialized: boolean;

    constructor(inj: Injector, @Optional() public form: FormComponent) {
        super(inj, WIDGET_CONFIG);
    }

    populateAction() {
        this.buttonDef = {
            key: this.key || this.binding,
            displayName: this['display-name'],
            show: this.show,
            class: this.class ? this.class : (this['widget-type'] === 'button' ? 'btn-secondary' : ''),
            iconclass: this.iconclass || '',
            title: _.isUndefined(this.title) ? (this['display-name'] || '') : this.title,
            action: this.action,
            accessroles: this.accessroles,
            shortcutkey: this.shortcutkey,
            disabled: this.disabled,
            tabindex: this.tabindex,
            iconname: this.iconname,
            type: this.type,
            updateMode: this['update-mode'],
            position: this.position,
            widgetType: this['widget-type'],
            hyperlink: this.hyperlink,
            target: this.target
        };
        this._propsInitialized = true;
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateAction();
        this.form.registerActions(this.buttonDef);
    }

    onPropertyChange(key, nv, ov) {
        if (!this._propsInitialized) {
            return;
        }
        switch (key) {
            case 'display-name':
                this.buttonDef.displayName = nv;
            default:
                this.buttonDef[key] = nv;
            break;
        }
    }
}
