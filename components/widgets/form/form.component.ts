import { ChangeDetectorRef, Component, ElementRef, HostBinding, Injector, forwardRef, HostListener, Attribute } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerFormProps } from './form.props';
import { getFieldLayoutConfig } from '../../utils/live-utils';
import { $appDigest } from '@utils/watcher';
import { getVariableName, performDataOperation } from '../../utils/data-utils';
declare const _;

registerFormProps();

const WIDGET_CONFIG = {widgetType: 'wm-form', hostClass: 'panel app-panel app-form'};
const LIVE_WIDGET_CONFIG = {widgetType: 'wm-liveform', hostClass: 'panel app-panel app-liveform liveform-inline'};


export abstract class ParentForm {
    ngForm: any;

    abstract registerFormFields(formField);

    abstract registerActions(formAction);

    abstract setPrimaryKey(fieldName);
}

const getWidgetConfig = isLiveForm => isLiveForm !== null ? LIVE_WIDGET_CONFIG : WIDGET_CONFIG;

@Component({
    selector: 'form[wmForm]',
    templateUrl: './form.component.html',
    providers: [{ provide: ParentForm, useExisting: forwardRef(() => FormComponent) }]
})
export class FormComponent extends BaseComponent implements ParentForm {

    captionAlignClass: string;
    validationtype: string;
    captionalign: string;
    captionposition: string;
    _widgetClass = '';
    captionwidth: string;
    _captionClass = '';
    ngForm: FormGroup;
    isUpdateMode = true;
    formFields = [];
    formfields = {};
    buttonArray = [];
    dataoutput;
    formdata;
    rowdata;
    isSelected;
    prevDataValues;
    prevDataObject;
    prevformFields;
    statusMessage = {
        caption: '',
        type: ''
    };
    messagelayout;
    errormessage;
    primaryKey;
    postmessage;
    _liveTableParent;

    // Live Form Methods
    edit: Function;
    update: Function;
    new: Function;
    cancel: Function;
    formCancel: Function;
    delete: Function;
    formSave: Function;
    save: Function;
    emptyDataModel: Function;
    setPrevDataValues: Function;
    getPrevDataValues: Function;
    setPrevformFields: Function;
    setPrimaryKey: () => {};

    private operationType;
    private binddataset;
    private variable;
    private isLayoutDialog;

    @HostBinding('autocomplete') autocomplete: boolean;
    @HostBinding('action') action: string;

    @HostListener('submit', ['$event']) submit($event) {
        if (this.isLiveForm !== null) {
            this.formSave();
            return;
        }

        this.submitForm($event);
    }

    @HostListener('reset') onReset() {
        this.reset();
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

    onResult(data, status, event) {
        /* whether service call success or failure call this method*/
        // triggerFn(scope.onResult, {$event: event, $isolateScope: scope, $data: data});
        // if (status === 'success') {
        //     /*if service call is success call this method */
        //     triggerFn(scope.onSuccess, {$event: event, $isolateScope: scope, $data: data});
        // } else {
        //     /* if service call fails call this method */
        //     triggerFn(scope.onError, {$event: event, $isolateScope: scope, $data: data});
        // }
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

    clearMessage() {
        this.toggleMessage(false);
    }

    private setLayoutConfig() {
        let layoutConfig;
        layoutConfig = getFieldLayoutConfig(this.captionwidth, this.captionposition);
        this._widgetClass = layoutConfig.widgetCls;
        this._captionClass = layoutConfig.captionCls;

        $appDigest();
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private fb: FormBuilder,
                @Attribute('dataset.bind') binddataset,
                @Attribute('wmLiveForm') public isLiveForm) {
        super(getWidgetConfig(isLiveForm), inj, elRef, cdr);

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
            field.value =  _.get(rowData, field.key || field.name);
        });

        this.constructDataObject();
    }

    resetFormState() {
        if (!this.ngForm) {
            return;
        }
        this.ngForm.markAsUntouched();
        this.ngForm.markAsPristine();
    }

    reset() {
        this.resetFormState();
        if (_.isArray(this.formFields)) {
            this.formFields.forEach((field) => {
                field.value = undefined;
            });
        }
        this.constructDataObject();
    }

    submitForm($event) {
        let formData, template;
        const formVariable = this.variable;
        // Disable the form submit if form is in invalid state.
        if (this.validateFieldsOnSubmit()) {
            return;
        }

        this.resetFormState();

        formData = this.constructDataObject();

        if (formVariable) {
            // If on submit is there execute it and if it returns true do service variable invoke else return
            // If its a service variable call setInput and assign form data and invoke the service
            if (formVariable) {
                performDataOperation(formVariable, formData, {})
                    .then((data) => {
                        this.toggleMessage(true, this.postmessage, 'success');
                        this.onResult(data, 'success', $event);
                        // Utils.triggerFn(scope.onSubmit, params);
                    }, (errMsg) => {
                        template = this.errormessage || errMsg;
                        this.toggleMessage(true, template, 'error');
                        this.onResult(errMsg, 'error', $event);
                        // Utils.triggerFn(scope.onSubmit, params);
                    });
            } else {
                // Utils.triggerFn(scope.onSubmit, params);
                this.onResult({}, 'success', $event);
            }
        } else {
            this.onResult({}, 'success', $event);
        }
    }


    callEvent(event) {
        // TODO: Change logic to handle all scenarios
        if (event) {
            this[event.substring(0, event.indexOf('('))]();
        }
    }
}
