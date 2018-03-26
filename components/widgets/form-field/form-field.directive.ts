import { ElementRef, Injector, Directive, Optional, ChangeDetectorRef, OnInit, AfterContentInit, ContentChild, ViewChild } from '@angular/core';
import { ParentForm } from '../form/form.component';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './form-field.props';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { toBoolean } from '@utils/utils';
declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-form-field', hostClass: ''};

@Directive({
    selector: '[wmFormField]',
    exportAs: 'wmFormField'
})
export class FormFieldDirective extends BaseComponent implements OnInit, AfterContentInit {

    @ContentChild('formWidget') formWidgetInstance;

    private _validators = [];
    private applyProps = new Set();

    ngForm: FormGroup;
    name: string;
    key: string;
    target: string;
    binding: string;
    widgettype: string;
    class = '';
    primarykey;
    show;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef,
                @Optional() public _parentForm: ParentForm, private fb: FormBuilder) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this);
    }

    onPropertyChange(key, newVal, ov?) {

        if (!this.formWidgetInstance) {
            this.applyProps.add(key);
            return;
        }

        this.formWidgetInstance.widget[key] = newVal;

        switch (key) {
            case 'required':
                if (newVal && this.show) {
                    this._validators.push(Validators.required);
                } else {
                    this._validators = _.pull(this._validators, Validators.required);
                }
                if (this.ngForm) {
                    this._control.setValidators(this._validators);
                    this._control.updateValueAndValidity();
                }
                break;
            case 'primary-key':
                this.primarykey = toBoolean(newVal);
                if (this.primarykey) {
                    this._parentForm.setPrimaryKey(this.key);
                }
                break;
            case 'show':
                if (!newVal) {
                    this.widget.required = false;
                }
                break;
        }
    }

    get datavalue() {
        return this.formWidgetInstance && this.formWidgetInstance.datavalue;
    }

    set datavalue(val) {
        if (this.formWidgetInstance.widget) {
            this.formWidgetInstance.widget.datavalue = val;
        }
    }

    get value() {
        return this.datavalue;
    }

    set value(val) {
        this.datavalue = val;
    }

    get _control() {
        return this.ngForm && this.ngForm.controls[this.key || this.name];
    }

    createControl() {
        return this.fb.control('', this._validators);
    }

    ngOnInit() {
        super.ngOnInit();
        this.ngForm = this._parentForm.ngForm;
        this.ngForm.addControl(this.key || this.name , this.createControl());
    }

    ngAfterContentInit() {
        if (this.formWidgetInstance) {
            setTimeout(() => {
                this.applyProps.forEach((key) => {
                    this.onPropertyChange(key, this[key]);
                });
            });
        }
        this.key = this.key || this.target || this.binding || this.name;
        this._parentForm.registerFormFields(this.widget);
    }
}

