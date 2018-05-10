import { Attribute, Component, forwardRef, HostBinding, HostListener, Injector, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs/Subject';

import { $appDigest, getClonedObject, removeClass, getFiles } from '@wm/core';

import { styler } from '../../framework/styler';
import { FormRef, WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerFormProps } from './form.props';
import { getFieldLayoutConfig } from '../../../utils/live-utils';
import { performDataOperation } from '../../../utils/data-utils';

declare const _;

registerFormProps();

const WIDGET_CONFIG = {widgetType: 'wm-form', hostClass: 'panel app-panel app-form'};
const LIVE_FORM_CONFIG = {widgetType: 'wm-liveform', hostClass: 'panel app-panel app-liveform liveform-inline'};
const LIVE_FILTER_CONFIG = {widgetType: 'wm-livefilter', hostClass: 'panel app-panel app-livefilter clearfix liveform-inline'};

const getWidgetConfig = (isLiveForm, isLiveFilter) => (isLiveForm !== null ? LIVE_FORM_CONFIG : (isLiveFilter !== null ? LIVE_FILTER_CONFIG : WIDGET_CONFIG));

@Component({
    selector: 'form[wmForm]',
    templateUrl: './form.component.html',
    providers: [
        {provide: FormRef, useExisting: forwardRef(() => FormComponent)},
        {provide: WidgetRef, useExisting: forwardRef(() => FormComponent)}
    ]
})
export class FormComponent extends StylableComponent implements OnDestroy {

    autoupdate;
    captionAlignClass: string;
    validationtype: string;
    captionalign: string;
    captionposition: string;
    captionsize;
    collapsible: boolean;
    expanded: boolean;
    elScope;
    _widgetClass = '';
    captionwidth: string;
    _captionClass = '';
    ngform: FormGroup;
    isUpdateMode = true;
    formFields = [];
    formfields = {};
    buttonArray = [];
    dataoutput;
    datasource;
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
    isLiveFilter;
    updateMode;
    name;
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
    setPrimaryKey: () => {};
    setPrevDataValues: Function;
    dialogId: string;
    // Live Filter
    enableemptyfilter;
    pagesize;
    result;
    clearFilter: Function;
    applyFilter: Function;
    filter: Function;
    filterOnDefault: Function;
    execute: Function;

    private operationType;
    private _isLayoutDialog;

    set isLayoutDialog(nv) {
        if (nv) {
            removeClass(this.nativeElement, 'panel app-panel liveform-inline');
        }
        this._isLayoutDialog = nv;
    }

    get isLayoutDialog() {
        return this._isLayoutDialog;
    }

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
        _.forEach(this.ngform.controls, (control) => control.markAsTouched());
    }

    validateFieldsOnSubmit() {
        // Disable the form submit if form is in invalid state. For delete operation, do not check the validation.
        if (this.operationType !== 'delete' && (this.validationtype === 'html' || this.validationtype === 'default')
                && this.ngform && this.ngform.invalid) {
            // TODO: For blob type required fields, even if file is present, required error is shown.
            // To prevent this, if value is present set the required validity to true
            // $($formEle.find('input[type="file"].app-blob-upload')).each(function () {
            //     var $blobEL = WM.element(this);
            //     if ($blobEL.val()) {
            //         ngform[$blobEL.attr('name')].$setValidity('required', true);
            //     }
            // });

            if (this.ngform.invalid) {
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
        this.invokeEventCallback('result', params);
        if (status) {
            // if service call is success call this method
            this.invokeEventCallback('success', params);
        } else {
            // if service call fails call this method
            this.invokeEventCallback('error', params);
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
        @Attribute('wmLiveForm') isLiveForm,
        @Attribute('wmLiveFilter') isLiveFilter
    ) {
        super(inj, getWidgetConfig(isLiveForm, isLiveFilter));

        styler(this.nativeElement, this);

        this.dialogId = this.nativeElement.getAttribute('dialogId');
        this.ngform = fb.group({});
        this.ngform.valueChanges
            .debounceTime(500)
            .subscribe(this.updateDataOutput.bind(this));
        this.elScope = this;
        this.resetForm = this.reset.bind(this);
        this.isLiveForm = isLiveForm !== null;
        this.isLiveFilter = isLiveFilter !== null;
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

            if (field.type === 'file') {
                fieldValue = getFiles(this.name, field.key + '_formWidget', field.multiple);
            }

            fieldName   = fieldTarget[0] || field.key || field.name;
            // In case of update the field will be already present in form data
            if (fieldTarget.length === 1) {
                formData[fieldName] = fieldValue;
            } else {
                formData[fieldTarget[0]]                 = formData[fieldTarget[0]] || {};
                formData[fieldTarget[0]][fieldTarget[1]] = fieldValue;
            }
        });
        this.dataoutput = {...this.ngform.value, ...formData};
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
        if (!this.ngform) {
            return;
        }
        setTimeout(() => {
            this.ngform.markAsUntouched();
            this.ngform.markAsPristine();
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

        if (this.onBeforeSubmitEvt && this.invokeEventCallback('beforesubmit', params)) {
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
                        this.invokeEventCallback('submit', params);
                    }, (errMsg) => {
                        template = this.errormessage || errMsg;
                        this.toggleMessage(true, template, 'error');
                        this.onResult(errMsg, false, $event);
                        this.invokeEventCallback('submit', params);
                    });
            } else {
                this.invokeEventCallback('submit', params);
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

    expandCollapsePanel() {
        if (this.collapsible) {
            // flip the active flag
            this.expanded = !this.expanded;
        }
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
