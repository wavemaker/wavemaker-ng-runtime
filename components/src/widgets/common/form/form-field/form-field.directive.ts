import { AfterContentInit, Attribute, ContentChild, Directive, Injector, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DataType, FormWidgetType, isDefined, toBoolean } from '@wm/core';

import { styler } from '../../../framework/styler';
import { FormRef } from '../../../framework/types';
import { registerProps } from './form-field.props';
import { getEvaluatedData, isDataSetWidget, provideAsWidgetRef } from '../../../../utils/widget-utils';
import { ALLFIELDS, applyFilterOnField, fetchRelatedFieldData, getDistinctValuesForField } from '../../../../utils/data-utils';
import { getDefaultViewModeWidget, parseValueByType } from '../../../../utils/live-utils';
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

    private applyProps;
    private fb;
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

        if ((this.form.isLiveForm || this.form.isLiveFilter) && isDataSetWidget(_widgetType)) {
            this.form.dataSourceChange$.subscribe(nv => this.onFormDataSourceChange(nv));
        }
    }

    onFormDataSourceChange(dataSource) {
        if (this['is-related'] && this.form.isLiveForm) {
            this.isDataSetBound = true;
            fetchRelatedFieldData(dataSource, this.widget, {
                relatedField: this.key,
                datafield: ALLFIELDS
            });
        } else {
            getDistinctValuesForField(dataSource, this.widget, {
                widget: 'widgettype',
                enableemptyfilter: this.form.enableemptyfilter
            });
            applyFilterOnField(dataSource, this.widget, this.form.formFields, this.value, {isFirst: true});
        }
    }

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

    setDefaultValue() {
        // In Edit, do  not set default values
        if (this.form.operationType === 'update') {
            return;
        }
        const defaultValue = this.defaultvalue;
        // Set the default value only if it exists.
        if (isDefined(defaultValue) && defaultValue !== null && defaultValue !== '' && defaultValue !== 'null') {
            this.value = parseValueByType(defaultValue, this.type, this.widgettype);
        } else {
            this.value = undefined;
        }
        /*If the field is primary but is assigned set readonly false.
         Assigned is where the user inputs the value while a new entry.
         This is not editable(in update mode) once entry is successful*/
        if (this.readonly && this['primary-key'] && this.generator === 'assigned') {
            this.widget.readonly = false;
        }
        this.form.setPrevDataValues();
    }

    private setUpValidators(customValidator?) {
        this._validators = [];

        if (this.required && this.show) {
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

    setFormWidget(key, val) {
        setTimeout(() => {
            this.formWidget.widget[key] = val;
        });
    }

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

        if (this.widgettype === FormWidgetType.UPLOAD) {
            if (key === 'required') {
                this.setUpValidators();
            }
            return;
        }

        this.setFormWidget(key, newVal);

        if (key !== 'placeholder') {
            this.setMaxFormWidget(key, newVal);
        }

        switch (key) {
            case 'defaultvalue':
                if (this.form.isLiveForm) {
                    this.setDefaultValue();
                } else if (this.form.isLiveFilter) {
                    this.minValue = newVal;
                    this.value = newVal;
                    this.form.filterOnDefault();
                } else {
                    this.value = parseValueByType(newVal, undefined, this.widgettype);
                }
                break;
            case 'maxdefaultvalue':
                this.maxValue = newVal;
                this.setMaxFormWidget('datavalue', newVal);
                setTimeout(() => {
                    this.form.filterOnDefault();
                });
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
        }
    }

    get datavalue() {
        return this.formWidget && this.formWidget.datavalue;
    }

    set datavalue(val) {
        if (this.formWidget.widget) {
            this.formWidget.widget.datavalue = val;
        }
    }

    get value() {
        return this.datavalue;
    }

    set value(val) {
        this.datavalue = val;
    }

    get _control() {
        return this.ngform && this.ngform.controls[this.key || this.name];
    }

    createControl() {
        let updateOn = this.updateon || 'blur';
        updateOn = updateOn === 'default' ? 'change' : updateOn;
        return this.fb.control('', {
            validators: this._validators,
            updateOn: updateOn
        });
    }

    onValueChange(val) {
        if (isDataSetWidget(this.widgettype)) {
            applyFilterOnField(this.form.datasource, this.widget, this.form.formFields, val);
        }
        if (this.form.isLiveFilter && this.form.autoupdate) {
            this.form.filter();
        }
    }

    setValidationMessage(val) {
        this.validationmessage = val;
        this.setUpValidators(customValidatorFn);
    }

    ngOnInit() {
        const fieldName = this.key || this.name;

        this.ngform = this.form.ngform;
        this.ngform.addControl(fieldName, this.createControl());

        if (this['is-range']) {
            this.ngform.addControl(fieldName + '_max', this.createControl());
        }

        if (this.form.isLiveForm || this.form.isLiveFilter) {
            this._control.valueChanges
                .debounceTime(500)
                .subscribe(this.onValueChange.bind(this));
        }

        super.ngOnInit();
        styler(this.nativeElement, this);
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

        if (this.type === DataType.BLOB) {
            let fileType;
            // Create the accepts string from file type and extensions
            fileType = this.filetype ? FILE_TYPES[this.filetype] : '';
            this.permitted = fileType + (this.extensions ? (fileType ? ',' : '') + this.extensions : '');
        }

        this.form.registerFormFields(this.widget);
    }
}

