import { AfterContentInit, Attribute, ContentChild, Directive, Inject, Injector, OnInit, Self } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DataType, debounce, FormWidgetType, isMobile, removeClass, toBoolean } from '@wm/core';

import { styler } from '../../../framework/styler';
import { registerProps } from './form-field.props';
import { getEvaluatedData, provideAsWidgetRef } from '../../../../utils/widget-utils';
import { getDefaultViewModeWidget } from '../../../../utils/live-utils';
import { StylableComponent } from '../../base/stylable.component';
import { FormComponent } from '../form.component';
import { Context } from '../../../framework/types';

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

registerProps();

@Directive({
    selector: '[wmFormField]',
    exportAs: 'wmFormField',
    providers: [
        provideAsWidgetRef(FormFieldDirective),
        {provide: Context, useValue: {}, multi: true}
    ]
})
export class FormFieldDirective extends StylableComponent implements OnInit, AfterContentInit {

    @ContentChild('formWidget') formWidget;
    @ContentChild('formWidgetMax') formWidgetMax;

    private fb;
    // excludeProps is used to store the props that should not be applied on inner widget
    private excludeProps;
    private _validators;

    ngform: FormGroup;
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
    _readonly;
    show;
    type;
    isDataSetBound;
    viewmodewidget;
    binddataset;
    binddisplayexpression;
    binddisplaylabel;
    form;
    filetype;
    extensions;
    permitted;
    isRange;

    // Validation properties
    required;
    maxchars;
    minvalue;
    maxvalue;
    regexp;
    validationmessage;

    private _debounceSetUpValidators;
    private _initPropsRes;
    private _name;
    private _key;

    constructor(
        inj: Injector,
        form: FormComponent,
        fb: FormBuilder,
        @Attribute('dataset.bind') binddataset,
        @Attribute('displayexpression.bind') binddisplayexpression: string,
        @Attribute('displaylabel.bind') binddisplaylabel: string,
        @Attribute('widgettype') _widgetType,
        @Attribute('name') name,
        @Attribute('key') key,
        @Attribute('is-range') isRange,
        @Attribute('pc-display') pcDisplay,
        @Attribute('mobile-display') mobileDisplay,
        @Self() @Inject(Context) contexts: Array<any>
    ) {

        const WIDGET_CONFIG = {
            widgetType: 'wm-form-field',
            hostClass: '',
            widgetSubType: 'wm-form-field-' + (_widgetType || FormWidgetType.TEXT).trim()
        };

        super(inj, WIDGET_CONFIG, new Promise(res => this._initPropsRes = res));

        this._validators = [];
        this.class = '';
        this.binddataset = binddataset;
        this.binddisplayexpression = binddisplayexpression;
        this.binddisplaylabel = binddisplaylabel;
        this.form = form;
        this.fb = fb;
        this._name = name;
        this._key = key;
        this.isRange = isRange;
        this.excludeProps = new Set(['type']);
        this.widgettype = _widgetType;

        if (this.binddataset) {
            this.isDataSetBound = true;
        }

        contexts[0]._onFocusField = this._onFocusField.bind(this);
        contexts[0]._onBlurField = this._onBlurField.bind(this);

        this._debounceSetUpValidators = debounce(() => this.setUpValidators(), 500);
    }

    _onFocusField($evt) {
        $($evt.target).closest('.live-field').addClass('active');
    }

    _onBlurField($evt) {
        $($evt.target).closest('.live-field').removeClass('active');
        this.setUpValidators();
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
            expression: displayExpr
        }, this.viewParent);
    }

    // Expression to be evaluated in view mode of form field
    getDisplayExpr() {
        const caption = [];
        const value = this.value;
        const displayExpr = this.displayexpression || this.displayfield || this.displaylabel;
        if (_.isObject(value)) {
            if (_.isArray(value)) {
                _.forEach(value, obj => {
                    if (_.isObject(obj)) {
                        caption.push(this.evaluateExpr(obj, displayExpr));
                    }
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
        if (this.formWidget && this.formWidget.widget) {
            this.formWidget.widget[key] = val;
        }
    }

    // Method to set the properties on inner max form widget (when range is selected)
    setMaxFormWidget(key, val) {
        if (this.formWidgetMax) {
            this.formWidgetMax.widget[key] = val;
        }
    }

    onPropertyChange(key, nv, ov?) {
        if (this.excludeProps.has(key)) {
            return;
        }

        // As upload widget is an HTML widget, only required property is setup
        if (this.widgettype === FormWidgetType.UPLOAD) {
            if (key === 'required') {
                this._debounceSetUpValidators();
            }
            super.onPropertyChange(key, nv, ov);
            return;
        }

        this.setFormWidget(key, nv);

        // Placeholder should not be setup on max widget
        if (key !== 'placeholder') {
            this.setMaxFormWidget(key, nv);
        }

        switch (key) {
            case 'defaultvalue':
                this.form.onFieldDefaultValueChange(this, nv);
                break;
            case 'maxdefaultvalue':
                this.maxValue = nv;
                this.setMaxFormWidget('datavalue', nv);
                this.form.onMaxDefaultValueChange();
                break;
            case 'maxplaceholder':
                this.setMaxFormWidget('placeholder', nv);
                break;
            case 'required':
            case 'maxchars':
            case 'minvalue':
            case 'maxvalue':
            case 'regexp':
            case 'show':
                this._debounceSetUpValidators();
                break;
            case 'primary-key':
                this.primarykey = toBoolean(nv);
                if (this.primarykey) {
                    this.form.setPrimaryKey(this._key);
                }
                break;
            case 'display-name':
                this.displayname = nv;
                break;
            case 'class':
                // Apply class on the inner widget only. Rremove from form filed element
                removeClass(this.getNativeElement(), nv);
                break;
        }

        if (key === 'tabindex') {
            return;
        }

        super.onPropertyChange(key, nv, ov);
    }

    get datavalue() {
        return this.formWidget && this.formWidget.datavalue;
    }

    set datavalue(val) {
        if (this._control && this.widgettype !== FormWidgetType.UPLOAD) {
            this._control.setValue(val);
        }
    }

    get value() {
        return this.datavalue;
    }

    set value(val) {
        this.datavalue = val;
    }

    get maxValue() {
        return this.formWidgetMax && this.formWidgetMax.datavalue;
    }

    set maxValue(val) {
        if (this._maxControl) {
            this._maxControl.setValue(val);
        }
    }

    get minValue() {
        return this.value;
    }

    set minValue(val) {
        this.value = val;
    }

    // Get the reactive form control
    get _control() {
        return this.ngform && this.ngform.controls[this._key || this._name];
    }

    // Get the reactive max form control
    get _maxControl() {
        return this.ngform && this.ngform.controls[(this._key || this._name) + '_max'];
    }

    // Create the reactive form control
    createControl() {
        return this.fb.control('', {
            validators: this._validators
        });
    }

    // On field value change, propagate event to parent form
    onValueChange(val) {
        if (!this.isDestroyed) {
            this.form.onFieldValueChange(this, val);
        }
    }

    // Method to expose validation message and set control to invalid
    setValidationMessage(val) {
        setTimeout(() => {
            this.validationmessage = val;
            this.setUpValidators(customValidatorFn);
        });
    }

    ngOnInit() {
        const fieldName = this._key || this._name;

        this.ngform = this.form.ngform;
        this.ngform.addControl(fieldName, this.createControl());
        const onValueChangeSubscription =  this._control.valueChanges
            .debounceTime(200)
            .subscribe(this.onValueChange.bind(this));
        this.registerDestroyListener(() => onValueChangeSubscription.unsubscribe());
        super.ngOnInit();
        styler(this.nativeElement, this);

        if (this.isRange === 'true') {
            this.ngform.addControl(fieldName + '_max', this.createControl());
        }
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();

        if (this.formWidget) {
            this._initPropsRes();

            // setting displayExpressions on the formwidget explicitly as expr was evaluated to "".
            this.setFormWidget('binddisplaylabel', this.binddisplaylabel);
            this.setFormWidget('binddisplayexpression', this.binddisplayexpression);
        }

        this.registerReadyStateListener(() => {
            this.key = this._key || this.target || this.binding || this._name;
            this.viewmodewidget = this.viewmodewidget || getDefaultViewModeWidget(this.widgettype);
            this._readonly = this.readonly; // Save readonly state

            // For upload widget, generate the permitted field
            if (this.type === DataType.BLOB) {
                let fileType;
                // Create the accepts string from file type and extensions
                fileType = this.filetype ? FILE_TYPES[this.filetype] : '';
                this.permitted = fileType + (this.extensions ? (fileType ? ',' : '') + this.extensions : '');
            }

            if (isMobile()) {
                if (!this['mobile-display']) {
                    this.widget.show = false;
                }
            } else {
                if (!this['pc-display']) {
                    this.widget.show = false;
                }
            }

            // Register the form field with parent form
            this.form.registerFormFields(this.widget);
        });
    }
}

