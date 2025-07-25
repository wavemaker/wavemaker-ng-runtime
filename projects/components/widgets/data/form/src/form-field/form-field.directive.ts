import {
    AfterContentInit,
    Attribute,
    ContentChild,
    Directive,
    HostListener,
    Inject,
    Injector,
    OnInit,
    Optional,
    Self
} from '@angular/core';
import {FormBuilder, FormGroup, NG_VALUE_ACCESSOR} from '@angular/forms';

import {debounceTime} from 'rxjs/operators';

import {
    addForIdAttributes,
    App,
    debounce,
    FormWidgetType,
    isDateTimeType,
    isDefined,
    isMobile,
    noop,
    Viewport
} from '@wm/core';
import {
    BaseFieldValidations,
    Context,
    getDefaultViewModeWidget,
    getEvaluatedData,
    provideAs,
    provideAsWidgetRef,
    StylableComponent
} from '@wm/components/base';
import {ListComponent} from '@wm/components/data/list';

import {registerProps} from './form-field.props';
import {FormComponent} from '../form.component';
import {forEach, get, isArray, isObject, join} from "lodash-es";

declare const $;

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
  standalone: true,
    selector: '[wmFormField]',
    exportAs: 'wmFormField',
    providers: [
        provideAsWidgetRef(FormFieldDirective),
        provideAs(FormFieldDirective, NG_VALUE_ACCESSOR, true),
        {provide: Context, useFactory: () => { return {} }, multi: true}
    ]
})
export class FormFieldDirective extends StylableComponent implements OnInit, AfterContentInit {
    static initializeProps = registerProps();

    @ContentChild('formWidget', {static: true}) formWidget;
    @ContentChild('formWidgetMax') formWidgetMax;

    private fb;
    private viewport;

    // excludeProps is used to store the props that should not be applied on inner widget
    private excludeProps;
    private _validators;
    private _oldUploadVal;

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
    readonly;
    show;
    type;
    isDataSetBound;
    viewmodewidget;
    binddataset;
    binddisplayexpression;
    bindChipclass;
    displayimagesrc: string;
    binddisplayimagesrc;
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
    fieldDefConfig;
    placeholder;
    inputtype;
    validationmessage;

    public _fieldName;

    private _debounceSetUpValidators;
    private _initPropsRes;
    private parentList;
    private showPendingSpinner: boolean;
    private _activeField: boolean;
    private notifyForFields: any;
    private fieldValidations;
    private _triggeredByUser: boolean;
    private _clicktriggeredByUser: boolean;
    private app: App;

    @HostListener('keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        this._triggeredByUser = true;
    }

    @HostListener('click', ['$event']) handleClick(event) {
        this._clicktriggeredByUser = true;
    }

    private isFocused;
    constructor(
        inj: Injector,
        form: FormComponent,
        fb: FormBuilder,
        viewport: Viewport,
        app: App,
        @Optional() parentList: ListComponent,
        @Attribute('chipclass.bind') bindChipclass: string,
        @Attribute('dataset.bind') binddataset,
        @Attribute('displayexpression.bind') binddisplayexpression: string,
        @Attribute('displaylabel.bind') binddisplaylabel: string,
        @Attribute('widgettype') _widgetType,
        @Attribute('name') name,
        @Attribute('displayimagesrc.bind') binddisplayimagesrc: String,
        @Attribute('key') key,
        @Attribute('is-range') isRange,
        @Attribute('pc-display') pcDisplay,
        @Attribute('mobile-display') mobileDisplay,
        @Attribute('tablet-display') tabletDisplay,
        @Self() @Inject(Context) contexts: Array<any>,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        const WIDGET_CONFIG = {
            widgetType: 'wm-form-field',
            hostClass: '',
            widgetSubType: 'wm-form-field-' + (_widgetType || FormWidgetType.TEXT).trim()
        };
        let resolveFn: Function = noop;

        super(inj, WIDGET_CONFIG, explicitContext, new Promise(res => resolveFn = res));
        this._initPropsRes = resolveFn;
        this.app = app;
        this.fieldDefConfig = {};
        this.class = '';
        this.binddataset = binddataset;
        this.binddisplayimagesrc = binddisplayimagesrc;
        this.binddisplayexpression = binddisplayexpression;
        this.bindChipclass = bindChipclass;
        this.binddisplaylabel = binddisplaylabel;
        this.form = form;
        this.fb = fb;
        this.viewport = viewport;
        this._fieldName = key || name;
        this.isRange = isRange;
        this.excludeProps = new Set(['type', 'name']);
        this.widgettype = _widgetType;
        this.parentList = parentList;
        this.notifyForFields = [];

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

    // Function to get the active element markup based on widget type
    getActiveElement() {
        const widgetType = this.nativeElement.getAttribute('widgettype');
        switch (widgetType) {
            case 'select':
                return this.nativeElement.querySelector('select');
            case 'textarea':
                return this.nativeElement.querySelector('textarea');
            default:
                return this.nativeElement.querySelector('input');
        }
    }

    setAriaAttributes() {
        const element = this.getActiveElement();
        if (this.ngform.controls[this._fieldName].invalid && this.ngform.controls[this._fieldName].touched && this.form.isUpdateMode) {
            this.nativeElement.setAttribute('__errormsg', `${this.nativeElement.getAttribute('__validationId')}`);
            element?.setAttribute('aria-invalid', `${this.ngform.controls[this._fieldName].invalid}`);
            element?.setAttribute('aria-describedby', `${this.nativeElement.getAttribute('__validationId')}`);
        } else {
            this.nativeElement.removeAttribute('__errormsg');
            element?.removeAttribute('aria-invalid');
            element?.removeAttribute('aria-describedby');
        }
    }

    _onBlurField($evt) {
        $($evt.target).closest('.live-field').removeClass('active');
        const ele = this.nativeElement.querySelector('p.text-danger');
        // Fix for [WMS-23959]: ADA issue - adding aria-describedby, aria-invalid, __errormsg attributes only when the form field is invalid , else removing the attributes
        this.setAriaAttributes();
        this._activeField = false;
        this._triggeredByUser = false;
        this._clicktriggeredByUser = false;
    }

    // Expression to be evaluated in view mode of form field
    evaluateExpr(object, displayField, displayExpr) {
        if (!displayExpr || !displayField) {
            displayField = Object.keys(object)[0];
            // If dataset is not ready, display expression will not be defined
            if (!displayField) {
                return;
            }
        }
        return getEvaluatedData(object, {
            field: displayField,
            expression: displayExpr
        }, this.viewParent);
    }

    // Expression to be evaluated in view mode of form field
    getDisplayExpr() {
        const caption = [];
        const value = this.value;
        const displayField = this.displayfield || this.displaylabel
        const displayExpr = this.displayexpression;
        if (isObject(value)) {
            if (isArray(value)) {
                forEach(value, obj => {
                    if (isObject(obj)) {
                        caption.push(this.evaluateExpr(obj, displayField, displayExpr));
                    }
                });
            } else {
                caption.push(this.evaluateExpr(value, displayField, displayExpr));
            }
            return join(caption, ',');
        }
        return (value === undefined || value === null) ? '' : this.value;
    }

    getCaption() {
        return (this.value === undefined || this.value === null) ? (get(this.form.dataoutput, this._fieldName) || '') : this.value;
    }

    // Notifies changes to observing validation fields
    notifyChanges() {
        forEach(this.notifyForFields, field => {
            field.fieldValidations.validate();
        });
    }

    // Registers observer of validation fields
    observeOn(fields) {
        this.fieldValidations.observeOn(fields, 'formfields');
    }

    // Method to setup validators for reactive form control
    setUpValidators(customValidator?) {
        this.fieldValidations.setUpValidators(customValidator);
    }

    // sets the custom async validation on the form field
    setAsyncValidators(validators) {
        this.fieldValidations.setAsyncValidators(validators);
    }

    // sets the default and custom sync validation on the form field
    setValidators(validators) {
        this.fieldValidations.setValidators(validators);
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

    // Method to set the properties on inner max form widget (when range is selected)
    setMaxFormWidget(key, val) {
        if (this.formWidgetMax) {
            this.formWidgetMax.widget[key] = val;
        }
    }

    onPropertyChange(key, nv, ov?) {
        const isFormDirty = this.form.dirty;

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
                // WMS-18906 : Do not make form as dirty during required prop initialization
                if (isFormDirty !== this.form.dirty) {
                    this.form.markAsPristine();
                }
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
    get displayValue() {
        return this.formWidget && this.formWidget.displayValue;
    }

    //Get the timestamp
    get timestamp(){
        return this.formWidget && this.formWidget.timestamp;
    }

    //Get the charlength
    get charlength(){
        return this.formWidget && this.formWidget.charlength;
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
            const captionEl =  $(this.nativeElement).find('.caption-floating');
            if (captionEl.length > 0) {
                // hasValue check whether form-field has a value from passed val attribute
                // Added sanity check on val to support values liked 0, false etc as input val - WMS-20084
                // explicitly checking for input value or -webkit-autofill to see whether there are any autofilled fields - WMS-20141

                const hasValue = ((isDefined(val) && val !== '' && val !== null) || captionEl.find('input').val()) || captionEl.find('input:-webkit-autofill').length;

                this.app.notify('captionPositionAnimate', {
                    displayVal: hasValue,
                    nativeEl: captionEl,
                    isSelectMultiple: this.formWidget && this.formWidget.multiple,
                    isFocused: this._activeField
                });
            }
           // Fix for [WMS-23959]: ADA issue - adding aria-describedby, aria-invalid, __errormsg attributes only when the form field is invalid , else removing the attributes
            this.setAriaAttributes();
            this.form.onFieldValueChange(this, val);
            this.notifyChanges();
            // Do mark as touched, only incase when user has entered an input but not through the script. Hence added mousedown event check
            // active class checks whether user is on the current field, if so marking the field as touched. And form field validation happens once a field is touched
            // _triggeredByUser checks whether the field is touched by the user or triggered from external script
            // WMS-22456: _clicktriggeredByUser checks when user selects datetimetype from picker, mark the field as touched to show validation errors in mobile

            if (this.$element.find('.active').length > 0 || this.form.touched) {
                if (this._triggeredByUser || (isMobile() && this._clicktriggeredByUser && isDateTimeType(this.widgettype))) {
                    this.ngform.controls[this._fieldName].markAsTouched();
                }
                this.fieldValidations.setCustomValidationMessage();
            }
        }
    }

    onStatusChange(status) {
        if (!this.isDestroyed) {
            this.showPendingSpinner = (status === 'PENDING');
            // while running validation, widget is disabled and spinner is shown
            // otherwise formWidget disabled state is reset to the state of the formField.
            if (status === 'PENDING') {
                this.formWidget.disabled = true;
            } else if (this.formWidget.disabled !== (this as any).disabled) {
                this.formWidget.disabled = (this as any).disabled;
            }
        }
    }

    // Method to expose validation message and set control to invalid
    setValidationMessage(val) {
        setTimeout(() => {
            this.validationmessage = val;
            this.setUpValidators(customValidatorFn);
        });
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
        readOnly = readOnly || this.form.readonly;
        this.setFormWidget('readonly', readOnly);
    }

    resetDisplayInput() {
        if ((!isDefined(this.value) || this.value === '')) {
            this.formWidget && this.formWidget.resetDisplayInput && this.formWidget.resetDisplayInput();
        }
    }

    reset() {
      if(this._control)
        this._control.reset();
    }

    triggerUploadEvent($event, eventName) {
        const params: any = { $event };
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
        this.value = get(this.form.formdata, this._fieldName);
    }

    ngOnInit() {
        this.ngform = this.form.ngform;
        this.registerFormField();
        // Instantiate custom validators class for form field
        this.fieldValidations = new BaseFieldValidations(this, this.formWidget, this.widgettype, this._control, this.form);
        super.ngOnInit();
    }

    prepareFormWidget() {
        this._initPropsRes();

        // setting displayExpressions on the formwidget explicitly as expr was evaluated to "".
        this.setFormWidget('binddisplaylabel', this.binddisplaylabel);
        this.setFormWidget('binddisplayexpression', this.binddisplayexpression);
        this.setFormWidget('binddisplayimagesrc', this.binddisplayimagesrc);
        this.setFormWidget('bindChipclass', this.bindChipclass);
        this.setFormWidget('binddataset', this.binddataset);

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
            if (isMobile() && this.viewport.isMobileType) {
                if (!this['mobile-display']) {
                    this.widget.show = false;
                }
            } else if (this.viewport.isTabletType) {
                if (!this['tablet-display']) {
                    this.widget.show = false;
                }
            } else {
                if (!this['pc-display']) {
                    this.widget.show = false;
                }
            }

            this.fieldDefConfig.displaname = this.displayname;
            this.fieldDefConfig.show = this.show;
            this.fieldDefConfig.isRelated = this['is-related'];
            this.fieldDefConfig.inputtype = this.inputtype;
            this.fieldDefConfig.generator = this.generator;
            this.fieldDefConfig.placeholder = this.placeholder;
            this.fieldDefConfig.primaryKey = this['primary-key'];
            this.fieldDefConfig.required = this.required;
            this.fieldDefConfig._readonly = this.readonly;
            this.fieldDefConfig.regexp = this.regexp;
            this.fieldDefConfig.type = this.type;
            this.fieldDefConfig.key = this.key;
            this.fieldDefConfig.mobileDisplay = this['mobile-display'];
            this.fieldDefConfig.name = this.name;
            this.fieldDefConfig.pcDisplay = this['pc-display'];
            this.fieldDefConfig.tabletDisplay = this['tablet-display'];
            this.fieldDefConfig.validationmessage = this.validationmessage;
            this.fieldDefConfig.viewmodewidget = this.viewmodewidget;
            this.fieldDefConfig.widget = this.widgettype;

            // Register the form field with parent form
            this.form.registerFormFields(this.widget);

            addForIdAttributes(this.nativeElement);

            this.setReadOnlyState();
        });
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
        if(this.widgetSubType === "wm-form-field-custom-widget" && this.formWidget.nativeElement)
            this.formWidget = this.formWidget.nativeElement.widget;
        if (this.formWidget) {
            if(this.widgetSubType === "wm-form-field-custom-widget") {
                this.formWidget.configSubject.asObservable().subscribe(() => {
                    this.prepareFormWidget();
                });
            } else {
                this.prepareFormWidget();
            }
        }
    }
}
