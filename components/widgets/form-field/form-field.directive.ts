import { ElementRef, Injector, Directive, Optional, ChangeDetectorRef, OnInit, AfterContentInit, ContentChild, ViewChild } from '@angular/core';
import { ParentForm } from '../form/form.component';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './form-field.props';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

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

    public _ngForm: FormGroup;
    public name: string;
    public key: string;
    public widgettype: string;
    public class = '';

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
                if (newVal) {
                    this._validators.push(Validators.required);
                } else {
                    this._validators = _.pull(this._validators, Validators.required);
                }
                if (this._ngForm) {
                    this._control.setValidators(this._validators);
                    this._control.updateValueAndValidity();
                }
                break;
        }
    }

    get _control() {
        return this._ngForm && this._ngForm.get(this.name || this.key);
    }

    createControl() {
        return this.fb.control('', this._validators);
    }

    ngOnInit() {
        super.ngOnInit();
        this._ngForm = this._parentForm._ngForm;
        this._ngForm.addControl(this.name || this.key, this.createControl());
    }

    ngAfterContentInit() {
        if (this.formWidgetInstance) {
            setTimeout(() => {
                this.applyProps.forEach((key) => {
                    this.onPropertyChange(key, this[key]);
                });
            });
        }
    }
}

