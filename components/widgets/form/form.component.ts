import { ChangeDetectorRef, Component, ElementRef, HostBinding, Injector, forwardRef, HostListener, Attribute } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerFormProps } from './form.props';
import { registerLiveFormProps } from './form.props';
import { getFieldLayoutConfig } from '../../utils/live-utils';
import { $appDigest } from '@utils/watcher';
import { getVariableName, performDataOperation } from '../../utils/data-utils';
import { isDefined, getClonedObject } from '@utils/utils';
declare const _;

registerFormProps();
registerLiveFormProps();

const DEFAULT_CLS = 'panel app-panel app-liveform liveform-inline';
const WIDGET_CONFIG = {widgetType: 'wm-liveform', hostClass: DEFAULT_CLS};

export abstract class ParentForm {
    ngForm: any;

    abstract registerFormFields(formField);

    abstract registerActions(formAction);
}

@Component({
    selector: 'form[wmForm]',
    templateUrl: './form.component.html',
    providers: [{ provide: ParentForm, useExisting: forwardRef(() => FormComponent) }]
})
export class FormComponent extends BaseComponent implements ParentForm {

    public captionAlignClass: string;
    public validationtype: string;
    public captionalign: string;
    public captionposition: string;
    public _widgetClass = '';
    public captionwidth: string;
    public _captionClass = '';
    public ngForm: FormGroup;
    public isUpdateMode = true;
    public formFields = [];
    public formfields = {};
    public buttonArray = [];
    public dataoutput;
    public rowdata;
    public isSelected;
    public prevformFields;
    public prevDataValues;
    public prevDataObject;
    public statusMessage = {
        caption: '',
        type: ''
    };
    public messagelayout;
    public errormessage;

    private operationType;
    private binddataset;
    private variable;
    private isLayoutDialog;

    @HostBinding('autocomplete') autocomplete: boolean;
    @HostBinding('action') action: string;

    @HostListener('submit') onSubmit() {
        this.formSave();
    }

    @HostListener('reset') onReset() {
    }

    highlightInvalidFields() {
        _.forEach(this.ngForm.controls, (control) => control.markAsTouched());
    }

    validateFieldsOnSubmit() {
        // Disable the form submit if form is in invalid state. For delete operation, do not check the validation.
        if (this.operationType !== 'delete' && (this.validationtype === 'html' || this.validationtype === 'default')
                && this.ngForm && this.ngForm.invalid) {
            // TODO: For blob type required fields, even if file is present, required error is shown.
            // To prevent this, if value is present set the required validity to true
            // $($formEle.find('input[type="file"].app-blob-upload')).each(function () {
            //     var $blobEL = WM.element(this);
            //     if ($blobEL.val()) {
            //         ngForm[$blobEL.attr('name')].$setValidity('required', true);
            //     }
            // });

            if (this.ngForm.invalid) {
                if (this.validationtype === 'default') {
                    this.highlightInvalidFields();
                }
                // TODO: Safari Validation
                return true;
            }
            return false;
        }
        return false;
    }

    onPropertyChange(key, newVal, ov?) {
        switch (key) {
            case 'captionalign':
                this.captionAlignClass = 'align-' + newVal;
                break;
            case 'captionposition':
                this.setLayoutConfig();
                break;
            case 'captionwidth':
                this.setLayoutConfig();
                break;
            case 'formdata':
            case 'rowdata':
                this.setDefaultValues(newVal);
                break;
            case 'defaultmode':
                if (newVal && newVal === 'Edit') {
                    this.isUpdateMode = true;
                } else {
                    this.isUpdateMode = false;
                }
                break;
        }
    }

    onFormSuccess() {
        this.isUpdateMode = false;
    }

    toggleMessage(show, msg?, type?, header?) {
        let template;
        if (show && msg) {
            if (this.messagelayout === 'Inline') {
                template = (type === 'error' && this.errormessage) ? this.errormessage : msg;
                this.statusMessage = {'caption': template || '', type: type};
            } else {
                template = (type === 'error' && this.errormessage) ? this.errormessage : msg;
                // wmToaster.show(type, WM.isDefined(header) ? header : type.toUpperCase(), template, undefined, 'trustedHtml');
            }
        } else {
            this.statusMessage.caption = '';
        }
    }

    private setLayoutConfig() {
        let layoutConfig;
        layoutConfig = getFieldLayoutConfig(this.captionwidth, this.captionposition);
        this._widgetClass = layoutConfig.widgetCls;
        this._captionClass = layoutConfig.captionCls;

        $appDigest();
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private fb: FormBuilder, @Attribute('dataset.bind') binddataset) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this);

        this.ngForm = fb.group({});

        this.binddataset = binddataset;
        this.variable = this.parent.Variables[getVariableName(this.binddataset)];
    }

    registerFormFields(formField) {
        this.formFields.push(formField);
        this.formfields[formField.key] = formField;
    }

    registerActions(formAction) {
        this.buttonArray.push(formAction);
    }

    constructDataObject() {
        const formData     = {};
        // Get all form fields and prepare form data as key value pairs
        _.forEach(this.formFields, field => {
            let fieldName,
                fieldTarget,
                fieldValue;
            fieldTarget = _.split(field.key || field.target, '.');
            fieldValue = field.datavalue || field._control.value;

            // TODO: Blob file
            // if (field.type === 'file') {
            //     fieldValue = Utils.getFiles(scope.name, field.key + '_formWidget', field.multiple);
            // }

            fieldName   = fieldTarget[0] || field.key || field.name;
            // In case of update the field will be already present in form data
            if (fieldTarget.length === 1) {
                formData[fieldName] = fieldValue;
            } else {
                formData[fieldTarget[0]]                 = formData[fieldTarget[0]] || {};
                formData[fieldTarget[0]][fieldTarget[1]] = fieldValue;
            }
        });
        this.dataoutput = formData;
        return formData;
    }

    setDefaultValues(rowData) {
        if (!this.formFields) {
            return;
        }

        this.formFields.forEach((field) => {
            field.datavalue =  _.get(rowData, field.key || field.name);
        });
    }

    resetFormState() {
        this.ngForm.markAsUntouched();
        this.ngForm.markAsPristine();
    }

    emptyDataModel() {
        this.formFields.forEach(function (field) {
            if (isDefined(field)) {
                field.datavalue = '';
            }
        });
    }

    setPrevDataValues() {
        if (!this.formFields) {
            return;
        }
        this.prevDataValues = this.formFields.map(function (obj) {
            return {'key': obj.key, 'value': obj.value};
        });
    }

    edit() {
        this.resetFormState();
        this.toggleMessage(false);
        this.isUpdateMode = true;
        this.operationType = 'update';
    }

    cancel() {
        this.formCancel();
    }

    formCancel() {
        this.toggleMessage(false);
        this.isUpdateMode = false;
    }

    new() {
        this.resetFormState();
        this.toggleMessage(false);
        if (this.isSelected && !this.isLayoutDialog) {
            // this.prevformFields = getClonedObject(this.formFields);
        }
        if (this.formFields && this.formFields.length > 0) {
            this.emptyDataModel();
        }
        this.setPrevDataValues();
        this.constructDataObject();
        this.isUpdateMode = true;
        this.operationType = 'insert';
    }

    formSave(event?, updateMode?, newForm?, callBackFn?) {
        let formData;
        // Disable the form submit if form is in invalid state.
        if (this.validateFieldsOnSubmit()) {
            return;
        }

        formData = this.constructDataObject();

        performDataOperation(formData, this.variable, {
            operationType: this.operationType,
            success: () => {
                this.toggleMessage(true, 'Form save success', 'success');
                this.onFormSuccess();
            },
            error: () => {
                this.toggleMessage(true, this.errormessage, 'success');
            }
        });
    }

    delete(callBackFn) {
        this.resetFormState();
        this.operationType = 'delete';
        this.prevDataObject = getClonedObject(this.rowdata || {});
        this.formSave(undefined, undefined, undefined, callBackFn);
    }


    callEvent(event) {
        // TODO: Change logic to handle all scenarios
        if (event) {
            this[event.substring(0, event.indexOf('('))]();
        }
    }
}
