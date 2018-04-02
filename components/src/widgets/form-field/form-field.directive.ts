import { ElementRef, Injector, Directive, Optional, ChangeDetectorRef, OnInit, AfterContentInit, ContentChild, Attribute } from '@angular/core';
import { ParentForm } from '../form/form.component';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './form-field.props';
import { FormBuilder,  FormGroup, Validators } from '@angular/forms';
import { toBoolean } from '@wm/utils';
import { getEvaluatedData, isDataSetWidget } from '../../utils/widget-utils';
import { fetchRelatedFieldData, getFormVariable, ALLFIELDS, getDistinctValuesForField } from '../../utils/data-utils';
declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-form-field', hostClass: ''};

@Directive({
    selector: '[wmFormField]',
    exportAs: 'wmFormField'
})
export class FormFieldDirective extends BaseComponent implements OnInit, AfterContentInit {

    @ContentChild('formWidget') formWidget;

    private _validators = [];
    private applyProps = new Set();

    ngForm: FormGroup;
    name: string;
    displayexpression;
    displayfield;
    displaylabel;
    key: string;
    target: string;
    binding: string;
    widgettype: string;
    class = '';
    primarykey;
    show;
    type;
    isDataSetBound;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef,
                @Optional() public form: ParentForm, private fb: FormBuilder,
                @Attribute('dataset.bind') public binddataset) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this);
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

    onPropertyChange(key, newVal, ov?) {

        if (!this.formWidget) {
            this.applyProps.add(key);
            return;
        }

        this.formWidget.widget[key] = newVal;

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
                    this.form.setPrimaryKey(this.key);
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
        this.form.registerFormFields(this.widget);

        if (this.binddataset) {
            this.isDataSetBound = true;
        } else if (isDataSetWidget(this.widgettype)) {
            if (this['is-related']) {
                this.isDataSetBound = true;
                fetchRelatedFieldData(getFormVariable(this.form), this.widget, {
                    relatedField: this.key,
                    datafield: ALLFIELDS
                });
            } else {
                getDistinctValuesForField(getFormVariable(this.form), this.widget, {widget: 'widgettype'});
            }
        }
    }
}

