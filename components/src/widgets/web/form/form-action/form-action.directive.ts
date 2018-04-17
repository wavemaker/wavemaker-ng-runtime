import { ChangeDetectorRef, Directive, ElementRef, Injector, OnInit, Optional } from '@angular/core';
import { ParentForm } from '../form.component';
import { registerProps } from './form-action.props';
import { BaseComponent } from '../../base/base.component';

declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-form-action', hostClass: ''};

@Directive({
    selector: '[wmFormAction]'
})
export class FormActionDirective extends BaseComponent implements OnInit {
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

    constructor(@Optional() public _parentForm: ParentForm, inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
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
        this._parentForm.registerActions(this.buttonDef);
    }
}
