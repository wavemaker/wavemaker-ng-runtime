import { AfterContentInit, Attribute, ContentChild, Directive, Injector, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { isDefined, toBoolean } from '@wm/core';

import { styler } from '../../framework/styler';
import { ParentForm } from '../form/form.component';
import { registerProps } from './form-field.props';
import { getEvaluatedData, isDataSetWidget } from '../../../utils/widget-utils';
import { ALLFIELDS, fetchRelatedFieldData, getDistinctValuesForField } from '../../../utils/data-utils';
import { getDefaultViewModeWidget, parseValueByType } from '../../../utils/live-utils';
import { StylableComponent } from '../base/stylable.component';

declare const _;

const DEFAULT_CLS = '';

@Directive({
    selector: '[wmFormField]',
    exportAs: 'wmFormField'
})
export class FormFieldDirective extends StylableComponent implements OnInit, AfterContentInit {

    @ContentChild('formWidget') formWidget;

    private _validators;
    private applyProps;
    private fb;

    ngForm: FormGroup;
    name: string;
    defaultvalue;
    displayexpression;
    displayfield;
    displaylabel;
    generator;
    key: string;
    target: string;
    binding: string;
    widgettype: string;
    class;
    primarykey;
    readonly;
    required;
    show;
    type;
    isDataSetBound;
    viewmodewidget;
    binddataset;
    form;

    constructor(
        inj: Injector,
        @Optional() form: ParentForm,
        fb: FormBuilder,
        @Attribute('dataset.bind') binddataset,
        @Attribute('widgettype') _widgetType
    ) {

        const WIDGET_CONFIG = {widgetType: _widgetType, hostClass: DEFAULT_CLS};

        registerProps(_widgetType);

        super(inj, WIDGET_CONFIG);

        this._validators = [];
        this.applyProps = new Set();
        this.class = '';
        this.binddataset = binddataset;
        this.form = form;
        this.fb = fb;

        if (this.binddataset) {
            this.isDataSetBound = true;
        }

        if (this.form.isLiveForm && isDataSetWidget(_widgetType)) {
            this.form.dataSourceChange$.subscribe(nv => this.onFormDataSourceChange(nv));
        }
    }

    onFormDataSourceChange(dataSource) {
        if (this['is-related']) {
            this.isDataSetBound = true;
            fetchRelatedFieldData(dataSource, this.widget, {
                relatedField: this.key,
                datafield: ALLFIELDS
            });
        } else {
            getDistinctValuesForField(dataSource, this.widget, {widget: 'widgettype'});
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
        // TODO: Blob
        // if (field.type === 'blob') {
        //     // Create the accepts string from file type and extensions
        //     fileType = field.filetype ? this.filetypes[field.filetype] : '';
        //     field.permitted = fileType + (field.extensions ? (fileType ? ',' : '') + field.extensions : '');
        // }
        /*If the field is primary but is assigned set readonly false.
         Assigned is where the user inputs the value while a new entry.
         This is not editable(in update mode) once entry is successful*/
        if (this.readonly && this['primary-key'] && this.generator === 'assigned') {
            this.widget.readonly = false;
        }
        this.form.setPrevDataValues();
    }

    private setRequired() {
        if (this.required && this.show) {
            this._validators.push(Validators.required);
        } else {
            this._validators = _.pull(this._validators, Validators.required);
        }
        if (this.ngForm) {
            this._control.setValidators(this._validators);
            this._control.updateValueAndValidity();
        }
    }

    onPropertyChange(key, newVal, ov?) {

        if (!this.formWidget) {
            this.applyProps.add(key);
            return;
        }

        this.formWidget.widget[key] = newVal;

        switch (key) {
            case 'defaultvalue':
                if (this.form.isLiveForm) {
                    this.setDefaultValue();
                } else {
                    this.value = parseValueByType(newVal, undefined, this.widgettype);
                }
                break;
            case 'required':
                this.setRequired();
                break;
            case 'primary-key':
                this.primarykey = toBoolean(newVal);
                if (this.primarykey) {
                    this.form.setPrimaryKey(this.key);
                }
                break;
            case 'show':
                this.setRequired();
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
        return this.ngForm && this.ngForm.controls[this.key || this.name];
    }

    createControl() {
        return this.fb.control('', this._validators);
    }

    ngOnInit() {
        super.ngOnInit();
        this.ngForm = this.form.ngForm;
        this.ngForm.addControl(this.key || this.name , this.createControl());
        styler(this.$element, this);
    }

    ngAfterContentInit() {
        if (this.formWidget) {
            setTimeout(() => {
                this.applyProps.forEach((key) => {
                    this.onPropertyChange(key, this[key]);
                });
            });
        }
        this.key = this.key || this.target || this.binding || this.name;
        this.viewmodewidget = this.viewmodewidget || getDefaultViewModeWidget(this.widgettype);
        this.form.registerFormFields(this.widget);
    }
}

