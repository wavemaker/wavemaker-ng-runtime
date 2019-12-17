import {AfterContentInit, Attribute, ContentChild, Directive, Inject, Injector, OnInit, Optional, Self} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { debounceTime } from 'rxjs/operators';

import { addForIdAttributes, debounce, DynamicComponentRefProvider, FormWidgetType, isDefined, isMobile, VALIDATOR, $unwatch, $watch } from '@wm/core';

import { registerProps } from './form-field.props';
import { getEvaluatedData, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
import { getDefaultViewModeWidget } from '../../../../utils/live-utils';
import { StylableComponent } from '../../base/stylable.component';
import { FormComponent } from '../form.component';
import { Context } from '../../../framework/types';
import { ListComponent } from '../../list/list.component';

declare const _, $;

// Custom validator to show validation error, if setValidationMessage method is used
const customValidatorFn = () => {
    return { custom: true };
};

const FILE_TYPES = {
    'image' : 'image/*',
    'video' : 'video/*',
    'audio' : 'audio/*'
};

const DEFAULT_VALIDATOR = {
    pattern: 'regexp',
    max: 'maxvalue',
    min: 'minvalue',
    required: 'required',
    maxlength: 'maxchars'
};

@Directive({
    selector: '[wmFormField]',
    exportAs: 'wmFormField',
    providers: [
        provideAsWidgetRef(FormFieldDirective),
        provideAsNgValueAccessor(FormFieldDirective),
        {provide: Context, useValue: {}, multi: true}
    ]
})
export class FormFieldDirective extends StylableComponent implements OnInit, AfterContentInit {
    static initializeProps = registerProps();

    @ContentChild('formWidget') formWidget;
    @ContentChild('formWidgetMax') formWidgetMax;

    private fb;
    // excludeProps is used to store the props that should not be applied on inner widget
    private excludeProps;
    private _validators;
    private _oldUploadVal;
    private dynamicComponentProvider;
    private userComponentParams;

    ngform: FormGroup;
    defaultvalue;
    displayexpression;
    displayfield;
    displaylabel;
    displayname;
    usercomponent;
    generator;
    key;
    target;
    binding;
    widgettype;
    class;
    readonly;
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
    period;
    isRange;
    name;

    // Validation properties
    required;
    maxchars;
    minvalue;
    maxvalue;
    regexp;
    validationmessage;
    hasValidators;

    public _fieldName;

    private _debounceSetUpValidators;
    private _initPropsRes;
    private parentList;
    private showPendingSpinner: boolean;
    private _syncValidators: any;
    private _asyncValidatorFn: any;
    private defaultValidatorMessages: any;
    private _activeField: boolean;
    private notifyForFields: any;

    constructor(
        inj: Injector,
        form: FormComponent,
        dynamicComponentProvider: DynamicComponentRefProvider,
        fb: FormBuilder,
        @Optional() parentList: ListComponent,
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
        this.dynamicComponentProvider = dynamicComponentProvider;
        this._fieldName = key || name;
        this.isRange = isRange;
        this.excludeProps = new Set(['type', 'name']);
        this.widgettype = _widgetType;
        this.parentList = parentList;
        this.defaultValidatorMessages = [];
        this.notifyForFields = [];
        this.userComponentParams = {};

        if (this.binddataset || this.$element.attr('dataset')) {
            this.isDataSetBound = true;
        }

        contexts[0]._onFocusField = this._onFocusField.bind(this);
        contexts[0]._onBlurField = this._onBlurField.bind(this);

        this._debounceSetUpValidators = debounce(() => this.setUpValidators(), 500);
    }

    _onFocusField($evt) {
        this._activeField = true;
        $($evt.target).closest('.live-field').addClass('active');
    }

    _onBlurField($evt) {
        $($evt.target).closest('.live-field').removeClass('active');
        this.setCustomValidationMessage();
        this._activeField = false;
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
        return (value === undefined || value === null) ? '' : this.value;
    }

    getCaption() {
        return (this.value === undefined || this.value === null) ? (_.get(this.form.dataoutput, this._fieldName) || '') : this.value;
    }

    // this method returns the collection of supported default validators
    private getDefaultValidators() {
        const _validator = [];
        if (this.required && this.show !== false) {
            // For checkbox/toggle widget, required validation should consider true value only
            if (this.widgettype === FormWidgetType.CHECKBOX || this.widgettype === FormWidgetType.TOGGLE) {
                _validator.push(Validators.requiredTrue);
            } else {
                _validator.push(Validators.required);
            }
        }
        if (this.maxchars) {
            _validator.push(Validators.maxLength(this.maxchars));
        }
        if (this.minvalue) {
            _validator.push(Validators.min(this.minvalue));
        }
        if (this.maxvalue && this.widgettype !== FormWidgetType.RATING) {
            _validator.push(Validators.max(this.maxvalue));
        }
        if (this.regexp) {
            _validator.push(Validators.pattern(this.regexp));
        }
        return _validator;
    }

    // Method to setup validators for reactive form control
    private setUpValidators(customValidator?) {
        if (this.hasValidators) {
            return;
        }
        this._validators = this.getDefaultValidators();

        if (_.isFunction(this.formWidget.validate)) {
            this._validators.push(this.formWidget.validate.bind(this.formWidget));
        }
        if (customValidator) {
            this._validators.push(customValidator);
        }

        if (this.ngform) {
            this._control.setValidators(this._validators);
            const opt = {};
            // updating the value only when prevData is not equal to current value.
            // emitEvent flag will prevent from emitting the valueChanges when value is equal to the prevDatavalue.
            if (this.value === this.formWidget.prevDatavalue) {
                opt['emitEvent'] = false;
            }
            this._control.updateValueAndValidity(opt);
        }
    }

    getPromiseList(validators) {
        const arr = [];
        _.forEach(validators, (fn, index) => {
            let promise = fn;
            if (fn instanceof Function && fn.bind) {
                promise = fn(this, this.form);
            }
            if (promise instanceof Promise) {
                arr.push(promise);
            }
        });
        return arr;
    }

    // this method sets the asyncValidation on the form field. Assigns validationmessages from the returned response
    setAsyncValidators(validators) {
        this._asyncValidatorFn = () => {
            return () => {
                return Promise.all(this.getPromiseList(validators)).then(() => {
                    this.validationmessage = '';
                    return null;
                }, err => {
                    // if err obj has validationMessage key, then set validationMessage using this value
                    // else return the value of the first key in the err object as validation message.
                    if (err.hasOwnProperty('errorMessage')) {
                        this.validationmessage = _.get(err, 'errorMessage');
                    } else {
                        const keys = _.keys(err);
                        this.validationmessage = (err[keys[0]]).toString();
                    }
                    return err;
                }).then(response => {
                    // form control status is not changed from pending. This is an angular issue refer https://github.com/angular/angular/issues/13200
                    const checkForStatusChange = () => {
                        setTimeout(() => {
                            if (this._control.status === 'PENDING') {
                                checkForStatusChange();
                            } else {
                                this.onStatusChange(this._control.status);
                            }
                        }, 100);
                    };
                    checkForStatusChange();
                    return response;
                });
            };
        };

        this._control.setAsyncValidators([this._asyncValidatorFn()]);
        this._control.updateValueAndValidity();
    }

    isDefaultValidator(type) {
        return _.get(VALIDATOR, _.toUpper(type));
    }

    // default validator is bound to a function then watch for value changes
    // otherwise set the value of default validator directly
    setDefaultValidator(key, value) {
        if (value.bind) {
            this.watchDefaultValidatorExpr(value, key);
        } else {
            this[key] = value;
        }
    }

    // sets the default validation on the form field
    setValidators(validators) {
        this.hasValidators = true;
        this._syncValidators = [];
        _.forEach(validators, (obj, index) => {
            // custom validation is bound to function.
            if (obj.bind) {
                validators[index] = obj.bind(undefined, this, this.form);
                this._syncValidators.push(validators[index]);
            } else {
                // checks for default validator like required, maxchars etc.
                const key = _.get(obj, 'type');
                this.defaultValidatorMessages[key] = _.get(obj, 'errorMessage');
                if (this.isDefaultValidator(key)) {
                    const value = _.get(obj, 'validator');
                    this.setDefaultValidator(key, value);
                    validators[index] = '';
                }
            }
        });

        // _syncValidators contains all the custom validations on the form field. will not include default validators.
        this._syncValidators = _.filter(validators, val => {
            if (val) {
                return val;
            }
        });
        this.applyDefaultValidators();
    }

    observeOn(fields) {
        _.forEach(fields, field => {
           const formfield = _.find(this.form.formfields, {'key': field});
           if (formfield) {
               if (!formfield.notifyForFields) {
                   formfield.notifyForFields = [];
               }
               formfield.notifyForFields.push(this);
           }
        });
    }

    notifyChanges() {
        _.forEach(this.notifyForFields, field => {
            field.validate();
        });
    }

    validate() {
        this.applyDefaultValidators();
        if (this._asyncValidatorFn) {
            this._control.setAsyncValidators([this._asyncValidatorFn()]);
            this._control.updateValueAndValidity();
        }
        this.form.highlightInvalidFields();
    }

    // Method to set the properties on inner form widget
    setFormWidget(key, val) {
        if (this.formWidget && this.formWidget.widget) {
            this.formWidget.widget[key] = val;
        }
    }

    boundFn(fn) {
        return fn();
    }

    // watches for changes in the bound function for default validators.
    watchDefaultValidatorExpr(fn, key) {
        const watchName = `${this.widgetId}_` + key + '_formField';
        $unwatch(watchName);
        this.registerDestroyListener($watch('boundFn(fn)', _.extend(this, this.viewParent), {fn}, (nv, ov) => {
            this.widget[key] = nv;
            this.applyDefaultValidators();
        }, watchName));
    }

    // invokes both custom sync validations and default validations.
    applyDefaultValidators() {
        const validators = this.getDefaultValidators();
        this._control.setValidators(_.concat(this._syncValidators || [], validators));
        this._control.updateValueAndValidity();
        this.setCustomValidationMessage();
    }

    // Method to set the properties on inner max form widget (when range is selected)
    setMaxFormWidget(key, val) {
        if (this.formWidgetMax) {
            this.formWidgetMax.widget[key] = val;
        }
    }

    onPropertyChange(key, nv, ov?) {
        if (key !== 'tabindex') {
            super.onPropertyChange(key, nv, ov);
        }

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
                if (nv) {
                    this.form.setPrimaryKey(this._fieldName);
                }
                break;
            case 'display-name':
                this.displayname = nv;
                break;
            case 'readonly':
               this.setReadOnlyState();
                break;
        }
    }

    onStyleChange(key, nv, ov?) {
        this.setFormWidget(key, nv);
        this.setMaxFormWidget(key, nv);
        super.onStyleChange(key, nv, ov);
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
        return this.ngform && this.ngform.controls[this._fieldName];
    }

    // Get the reactive max form control
    get _maxControl() {
        return this.ngform && this.ngform.controls[this._fieldName + '_max'];
    }

    // Get the displayValue
    get displayValue () {
    return this.formWidget && this.formWidget.displayValue;
    }

    // Create the reactive form control
    createControl() {
        return this.fb.control(undefined, {
            validators: this._validators
        });
    }

    // On field value change, propagate event to parent form
    onValueChange(val) {
        if (!this.isDestroyed) {
            this.form.onFieldValueChange(this, val);
            this.notifyChanges();
        }
    }

    onStatusChange(status) {
        if (!this.isDestroyed) {
            this.showPendingSpinner = (status === 'PENDING');
            this.formWidget.disabled = (status === 'PENDING');
        }
    }

    // Method to expose validation message and set control to invalid
    setValidationMessage(val) {
        setTimeout(() => {
            this.validationmessage = val;
            this.setUpValidators(customValidatorFn);
        });
    }

    // sets the validation message from the control errors.
    setCustomValidationMessage() {
        const fieldErrors = this._control.errors;

        if (!fieldErrors) {
            return;
        }
        if (fieldErrors.hasOwnProperty('errorMessage')) {
            this.validationmessage = _.get(fieldErrors, 'errorMessage');
        } else {
            const keys = _.keys(fieldErrors);
            const key = keys[0];
            if (_.get(DEFAULT_VALIDATOR, key)) {
                this.validationmessage = _.get(this.defaultValidatorMessages, DEFAULT_VALIDATOR[key]);
            } else {
                this.validationmessage = (fieldErrors[key]).toString();
            }
        }
    }

    setReadOnlyState() {
        let readOnly;
        if (this.form.isUpdateMode) {
            if (this['primary-key'] && !this['is-related'] && !this.period) {
                /*If the field is primary but is assigned set readonly false.
                   Assigned is where the user inputs the value while a new entry.
                   This is not editable(in update mode) once entry is successful*/
                readOnly = !(this.generator === 'assigned' && this.form.operationType !== 'update');
            } else {
                readOnly = this.readonly;
            }
        } else {
            // In view mode, set widget state to readonly always
            readOnly = true;
        }
        this.setFormWidget('readonly', readOnly);
    }

    resetDisplayInput() {
        if ((!isDefined(this.value) || this.value === '')) {
            this.formWidget && this.formWidget.resetDisplayInput && this.formWidget.resetDisplayInput();
        }
    }

    triggerUploadEvent($event, eventName) {
        const params: any = {$event};
        if (eventName === 'change') {
            params.newVal = $event.target.files;
            params.oldVal = this._oldUploadVal;
            this._oldUploadVal = params.newVal;
        }
        this.invokeEventCallback(eventName, params);
    }

    private registerFormField() {

        const fieldName = this._fieldName;

        if (this.parentList && !(this.form.parentList === this.parentList)) {
            let counter = 1;
            let _fieldName = fieldName;
            while (this.ngform.controls.hasOwnProperty(_fieldName)) {
                _fieldName = `${fieldName}_${counter}`;
                counter++;
            }
            this.ngform.addControl(_fieldName, this.createControl());
            this._fieldName = _fieldName;
         } else {
            this.ngform.addControl(fieldName, this.createControl());
        }
        const onValueChangeSubscription = this._control.valueChanges
            .pipe(debounceTime(200))
            .subscribe(this.onValueChange.bind(this));
        this.registerDestroyListener(() => onValueChangeSubscription.unsubscribe());

        const onStatusChangeSubscription = this._control.statusChanges
            .pipe(debounceTime(100))
            .subscribe(this.onStatusChange.bind(this));
        this.registerDestroyListener(() => onStatusChangeSubscription.unsubscribe());

        if (this.isRange === 'true') {
            this.ngform.addControl(fieldName + '_max', this.createControl());
            // registering for valueChanges on MaxformWidget
            const onMaxValueChangeSubscription = this._maxControl.valueChanges
                .pipe(debounceTime(200))
                .subscribe(this.onValueChange.bind(this));
            this.registerDestroyListener(() => onMaxValueChangeSubscription.unsubscribe());
        }
        this.value =  _.get(this.form.formdata, this._fieldName);
    }

    ngOnInit() {
        this.ngform = this.form.ngform;
        this.registerFormField();
        super.ngOnInit();
    }

    onValueChanged(newVal?, oldVal?) {
        this.value = this.usercomponent.getValue();
    }

    setValidState(state, message?) {
        if (!state) {
            this._control.markAsTouched();
            this._control.setErrors({'incorrect': true});
            this.validationmessage = message;
        } else {
            this._control.setErrors(null);
            this.validationmessage = '';
        }
    }

    setTemplateComponent(template) {
        this.usercomponent = new template();
        this.userComponentParams.onValueChanged = () => {
            this.onValueChanged();
        };
        this.userComponentParams.setValidState = (state, message?) => {
            this.setValidState(state, message);
        };
        this.userComponentParams.fieldDef = this.widget;
        const markup = `<div renderComponent [ngClass]="{'ng-invalid': _control.invalid, 'ng-touched': _control.touched}" [customclass]="usercomponent" [item]="userComponentParams"></div>`;
        this.dynamicComponentProvider.addComponent(this.$element.find('.form-control-static'), markup, this, {method: 'after'});
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
            this.key = this._fieldName || this.target || this.binding;
            this.viewmodewidget = this.viewmodewidget || getDefaultViewModeWidget(this.widgettype);

            // For upload widget, generate the permitted field
            if (this.widgettype === FormWidgetType.UPLOAD) {
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

            addForIdAttributes(this.nativeElement);

            this.setReadOnlyState();
        });
    }
}
