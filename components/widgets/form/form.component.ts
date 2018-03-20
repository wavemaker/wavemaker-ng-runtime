import { ChangeDetectorRef, Component, ElementRef, HostBinding, Injector, forwardRef, HostListener } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './form.props';
import { getFieldLayoutConfig } from '../../utils/live-utils';
import { $appDigest } from '@utils/watcher';
declare const _;

registerProps();

const DEFAULT_CLS = 'panel app-panel app-form';
const WIDGET_CONFIG = {widgetType: 'wm-form', hostClass: DEFAULT_CLS};

export abstract class ParentForm {
    ngForm: any;

    abstract registerFormFields(formField);
}

@Component({
    selector: 'form[wmForm]',
    templateUrl: './form.component.html',
    providers: [{ provide: ParentForm, useExisting: forwardRef(() => FormComponent) }]
})
export class FormComponent extends BaseComponent {

    public statusMessage: string;
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
    public dataoutput;

    private operationType;

    @HostBinding('autocomplete') autocomplete: boolean;
    @HostBinding('action') action: string;

    @HostListener('submit') onSubmit() {
        this.submitForm();
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

    submitForm() {
        let formData;
        // Disable the form submit if form is in invalid state.
        if (this.validateFieldsOnSubmit()) {
            return;
        }

        formData = this.constructDataObject();
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
        }
    }

    private setLayoutConfig() {
        let layoutConfig;
        layoutConfig = getFieldLayoutConfig(this.captionwidth, this.captionposition);
        this._widgetClass = layoutConfig.widgetCls;
        this._captionClass = layoutConfig.captionCls;

        $appDigest();
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private fb: FormBuilder) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this);

        this.ngForm = fb.group({});
    }

    registerFormFields(formField) {
        this.formFields.push(formField);
        this.formfields[formField.key] = formField;
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
}
