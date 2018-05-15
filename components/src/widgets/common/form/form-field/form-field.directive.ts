import { AfterContentInit, Attribute, ContentChild, Directive, Injector, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DataType, FormWidgetType, toBoolean, removeClass } from '@wm/core';

import { styler } from '../../../framework/styler';
import { FormRef } from '../../../framework/types';
import { registerProps } from './form-field.props';
import { getEvaluatedData, provideAsWidgetRef } from '../../../../utils/widget-utils';
import { getDefaultViewModeWidget } from '../../../../utils/live-utils';
import { StylableComponent } from '../../base/stylable.component';

declare const _;

// Custom validator to show validation error, if setValidationMessage method is used
const customValidatorFn = () => {
    return { custom: true };
};

const FILE_TYPES = {
    'image' : 'image/*',
    'video' : 'video/*',
    'audio' : 'audio/*'
};

@Directive({
    selector: '[wmFormField]',
    exportAs: 'wmFormField',
    providers: [
        provideAsWidgetRef(FormFieldDirective)
    ]
})
export class FormFieldDirective extends StylableComponent implements OnInit, AfterContentInit {

    @ContentChild('formWidget') formWidget;
    @ContentChild('formWidgetMax') formWidgetMax;

    // applyProps is used to store the props to be applied on inner form widget, after it is initialized
    private applyProps;
    private fb;
    // excludeProps is used to store the props that should not be applied on inner widget
    private excludeProps;
    private _validators;

    ngform: FormGroup;
    name;
    defaultvalue;
    displayexpression;
    displayfield;
    displaylabel;
    displayname;
    generator;
    key;
    target;
    binding;
    widgettype;
    class;
    primarykey;
    readonly;
    show;
    type;
    isDataSetBound;
    viewmodewidget;
    binddataset;
    form;
    updateon;
    filetype;
    extensions;
    permitted;

    // Range values
    minValue;
    maxValue;

    // Validation properties
    required;
    maxchars;
    minvalue;
    maxvalue;
    regexp;
    validationmessage;

    constructor(
        inj: Injector,
        @Optional() form: FormRef,
        fb: FormBuilder,
        @Attribute('dataset.bind') binddataset,
        @Attribute('widgettype') _widgetType,
        @Attribute('name') name,
        @Attribute('key') key,
    ) {

        const WIDGET_CONFIG = {widgetType: _widgetType, hostClass: ''};

        registerProps(_widgetType);

        super(inj, WIDGET_CONFIG);

        this._validators = [];
        this.applyProps = new Set();
        this.class = '';
        this.binddataset = binddataset;
        this.form = form;
        this.fb = fb;
        this.name = name;
        this.key = key;
        this.excludeProps = new Set(['type']);
        this.widgettype = _widgetType;

        if (this.binddataset) {
            this.isDataSetBound = true;
        }
    }

    // Expression to be evaluated in view mode of form field
    evaluateExpr(object, displayExpr) {
        if (!displayExpr) {
            displayExpr = Object.keys(object)[0];
            // If dataset is not ready, display expression will not be defined
            if (!displayExpr) {
                return;
            }
        }
        return getEvaluatedData(object, {
            displayexpression: displayExpr
        });
    }

    // Expression to be evaluated in view mode of form field
    getDisplayExpr() {
        const caption = [];
        const value = this.value;
        const displayExpr = this.displayexpression || this.displayfield || this.displaylabel;
        if (_.isObject(value)) {
            if (_.isArray(value)) {
                _.forEach(value, function (obj) {
                    caption.push(this.evaluateExpr(obj, displayExpr));
                });
            } else {
                caption.push(this.evaluateExpr(value, displayExpr));
            }
            return _.join(caption, ',');
        }
        return value;
    }

    // Method to setup validators for reactive form control
    private setUpValidators(customValidator?) {
        this._validators = [];

        if (this.required && this.show !== false) {
            this._validators.push(Validators.required);
        }
        if (this.maxchars) {
            this._validators.push(Validators.maxLength(this.maxchars));
        }
        if (this.minvalue) {
            this._validators.push(Validators.min(this.minvalue));
        }
        if (this.maxvalue) {
            this._validators.push(Validators.max(this.maxvalue));
        }
        if (this.regexp) {
            this._validators.push(Validators.pattern(this.regexp));
        }
        if (customValidator) {
            this._validators.push(customValidator);
        }

        if (this.ngform) {
            this._control.setValidators(this._validators);
            this._control.updateValueAndValidity();
        }
    }

    // Method to set the properties on inner form widget
    setFormWidget(key, val) {
        setTimeout(() => {
            this.formWidget.widget[key] = val;
        });
    }

    // Method to set the properties on inner max form widget (when range is selected)
    setMaxFormWidget(key, val) {
        if (this.formWidgetMax) {
            setTimeout(() => {
                this.formWidgetMax.widget[key] = val;
            });
        }
    }

    onPropertyChange(key, newVal, ov?) {
        if (this.excludeProps.has(key)) {
            return;
        }

        if (!this.formWidget) {
            this.applyProps.add(key);
            return;
        }

        // As upload widget is an HTML widget, only required property is setup
        if (this.widgettype === FormWidgetType.UPLOAD) {
            if (key === 'required') {
                this.setUpValidators();
            }
            return;
        }

        this.setFormWidget(key, newVal);

        // Placeholder should not be setup on max widget
        if (key !== 'placeholder') {
            this.setMaxFormWidget(key, newVal);
        }

        switch (key) {
            case 'defaultvalue':
                this.form.onFieldDefaultValueChange(this, newVal);
                break;
            case 'maxdefaultvalue':
                this.maxValue = newVal;
                this.setMaxFormWidget('datavalue', newVal);
                this.form.onMaxDefaultValueChange();
                break;
            case 'maxplaceholder':
                this.setMaxFormWidget('placeholder', newVal);
                break;
            case 'required':
            case 'maxchars':
            case 'minvalue':
            case 'maxvalue':
            case 'regexp':
            case 'show':
                this.setUpValidators();
                break;
            case 'primary-key':
                this.primarykey = toBoolean(newVal);
                if (this.primarykey) {
                    this.form.setPrimaryKey(this.key);
                }
                break;
            case 'display-name':
                this.displayname = newVal;
                break;
            case 'class':
                // Apply class on the inner widget only. Rremove from form filed element
                removeClass(this.getNativeElement(), newVal);
                break;
        }
    }

    get datavalue() {
        return this.formWidget && this.formWidget.datavalue;
    }

    set datavalue(val) {
        if (this._control) {
            this._control.setValue(val);
        }
    }

    get value() {
        return this.datavalue;
    }

    set value(val) {
        this.datavalue = val;
    }

    // Get the reactive form control
    get _control() {
        return this.ngform && this.ngform.controls[this.key || this.name];
    }

    // Create the reactive form control
    createControl() {
        let updateOn = this.updateon || 'blur';
        updateOn = updateOn === 'default' ? 'change' : updateOn;
        return this.fb.control('', {
            validators: this._validators,
            updateOn: updateOn
        });
    }

    // On field value change, propagate event to parent form
    onValueChange(val) {
        this.form.onFieldValueChange(this, val);
    }

    // Method to expose validation message and set control to invalid
    setValidationMessage(val) {
        this.validationmessage = val;
        this.setUpValidators(customValidatorFn);
    }

    ngOnInit() {
        const fieldName = this.key || this.name;

        this.ngform = this.form.ngform;
        this.ngform.addControl(fieldName, this.createControl());

        this._control.valueChanges
            .debounceTime(200)
            .subscribe(this.onValueChange.bind(this));

        super.ngOnInit();
        styler(this.nativeElement, this);

        if (this['is-range']) {
            this.ngform.addControl(fieldName + '_max', this.createControl());
        }
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
        if (this.formWidget) {
            setTimeout(() => {
                this.applyProps.forEach((key) => {
                    this.onPropertyChange(key, this[key]);
                });
            });
        }
        this.key = this.key || this.target || this.binding || this.name;
        this.viewmodewidget = this.viewmodewidget || getDefaultViewModeWidget(this.widgettype);

        // For upload widget, generate the permitted field
        if (this.type === DataType.BLOB) {
            let fileType;
            // Create the accepts string from file type and extensions
            fileType = this.filetype ? FILE_TYPES[this.filetype] : '';
            this.permitted = fileType + (this.extensions ? (fileType ? ',' : '') + this.extensions : '');
        }

        // Register the form field with parent form
        this.form.registerFormFields(this.widget);
    }
}

