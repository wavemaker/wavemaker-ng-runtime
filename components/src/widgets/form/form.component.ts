import { Attribute, Component, forwardRef, HostBinding, HostListener, Injector, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs/Subject';

import { $appDigest, getClonedObject, removeClass } from '@wm/utils';

import { styler } from '../base/framework/styler';
import { IStylableComponent } from '../base/framework/types';
import { BaseComponent } from '../base/base.component';
import { registerFormProps } from './form.props';
import { getFieldLayoutConfig } from '../../utils/live-utils';
import { performDataOperation } from '../../utils/data-utils';
import { invokeEventHandler } from '../../utils/widget-utils';

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
export class FormComponent extends BaseComponent implements ParentForm, OnDestroy {

    captionAlignClass: string;
    validationtype: string;
    captionalign: string;
    captionposition: string;
    captionsize;
    elScope;
    _widgetClass = '';
    captionwidth: string;
    _captionClass = '';
    ngForm: FormGroup;
    isUpdateMode = true;
    formFields = [];
    formfields = {};
    buttonArray = [];
    dataoutput;
    dataSourceChange = new Subject();
    dataSourceChange$ = this.dataSourceChange.asObservable();
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
    isLiveForm;
    updateMode;
    resetForm: Function;
    // Live Form Methods
    clearData: Function;
    edit: Function;
    update: Function;
    new: Function;
    cancel: Function;
    formCancel: Function;
    delete: Function;
    formSave: Function;
    findOperationType: Function;
    save: Function;
    saveAndNew: Function;
    saveAndView: Function;
    emptyDataModel: Function;
    setDefaultValues: Function;
    setPrevDataValues: Function;
    getPrevDataValues: Function;
    setPrevformFields: Function;
    setPrimaryKey: () => {};
    dialogId: string;
    datasource;

    private operationType;
    private _isLayoutDialog;

    set isLayoutDialog(nv) {
        if (nv) {
            removeClass(this.$element, 'panel app-panel liveform-inline');
        }
        this._isLayoutDialog = nv;
    }

    get isLayoutDialog() {
        return this._isLayoutDialog;
    }

    @HostBinding('autocomplete') autocomplete: boolean;
    @HostBinding('action') action: string;

    @HostListener('submit', ['$event']) submit($event) {
        if (this.isLiveForm) {
            this.formSave($event);
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
            case 'captionsize':
                this.captionsize = newVal;
                break;
            case 'novalidate':
                //  Set validation type based on the novalidate property
                this.widget.validationtype = (newVal === true || newVal === 'true') ? 'none' : 'default';
                break;
            case 'formdata':
            case 'rowdata':
                this.setFormData(newVal);
                break;
            case 'defaultmode':
                if (newVal && newVal === 'Edit') {
                    this.updateMode = true;
                } else {
                    this.updateMode = false;
                }
                this.isUpdateMode = this.updateMode;
                break;
            case 'datasource':
                this.dataSourceChange.next(this.datasource);
                break;
        }
    }

    onResult(data, status, event?) {
        const params = {$event: event, $data: data};
        // whether service call success or failure call this method
        invokeEventHandler(this, 'result', params);
        if (status) {
            // if service call is success call this method
            invokeEventHandler(this, 'success', params);
        } else {
            // if service call fails call this method
            invokeEventHandler(this, 'error', params);
        }
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

    constructor(
        inj: Injector,
        private fb: FormBuilder,
        @Attribute('beforesubmit.event') public onBeforeSubmitEvt,
        @Attribute('submit.event') public onSubmitEvt,
        @Attribute('dataset.bind') public binddataset,
        @Attribute('wmLiveForm') isLiveForm
    ) {
        super(inj, getWidgetConfig(isLiveForm));

        styler(this.nativeElement, this as IStylableComponent);

        this.dialogId = this.nativeElement.getAttribute('dialogId');
        this.ngForm = fb.group({});
        this.ngForm.valueChanges
            .debounceTime(500)
            .subscribe(() => {
                this.updateDataOutput();
            });
        this.elScope = this;
        this.resetForm = this.reset.bind(this);
        this.isLiveForm = isLiveForm !== null;
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
        this.dataoutput = {...this.ngForm.value, ...formData};
        return this.dataoutput;
    }

    updateDataOutput() {
        this.constructDataObject();
    }

    setFormData(rowData) {
        if (!this.formFields || _.isEmpty(this.formFields)) {
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
        setTimeout(() => {
            this.ngForm.markAsUntouched();
            this.ngForm.markAsPristine();
        });
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
        let formData, template, params;
        const dataSource = this.datasource;
        // Disable the form submit if form is in invalid state.
        if (this.validateFieldsOnSubmit()) {
            return;
        }

        this.resetFormState();

        formData = getClonedObject(this.constructDataObject());

        params = {$event: event, $formData: formData, $data: formData};

        if (this.onBeforeSubmitEvt && invokeEventHandler(this, 'beforesubmit', params)) {
            return;
        }

        if (this.onSubmitEvt || dataSource) {
            // If on submit is there execute it and if it returns true do service variable invoke else return
            // If its a service variable call setInput and assign form data and invoke the service
            if (dataSource) {
                performDataOperation(dataSource, formData, {})
                    .then((data) => {
                        this.toggleMessage(true, this.postmessage, 'success');
                        this.onResult(data, true, $event);
                        invokeEventHandler(this, 'submit', params);
                    }, (errMsg) => {
                        template = this.errormessage || errMsg;
                        this.toggleMessage(true, template, 'error');
                        this.onResult(errMsg, false, $event);
                        invokeEventHandler(this, 'submit', params);
                    });
            } else {
                invokeEventHandler(this, 'submit', params);
                this.onResult({}, true, $event);
            }
        } else {
            this.onResult({}, true, $event);
        }
    }

    showButtons(position) {
        return _.some(this.buttonArray, btn => {
            return _.includes(btn.position, position) && btn.updateMode === this.isUpdateMode;
        });
    }

    get mode() {
        return this.operationType || this.findOperationType();
    }

    callEvent(event) {
        // TODO: Change logic to handle all scenarios
        if (event) {
            this[event.substring(0, event.indexOf('('))]();
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.dataSourceChange.complete();
    }
}
