import { Attribute, Component, HostBinding, HostListener, Injector, OnDestroy, SkipSelf, Optional, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { $appDigest, getClonedObject, getFiles, removeClass, App, $parseEvent } from '@wm/core';
import { transpile } from '@wm/transpiler';

import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerFormProps } from './form.props';
import { getFieldLayoutConfig, parseValueByType } from '../../../utils/live-utils';
import { performDataOperation } from '../../../utils/data-utils';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

declare const _;

registerFormProps();

const WIDGET_CONFIG = {widgetType: 'wm-form', hostClass: 'panel app-panel app-form'};
const LOGIN_FORM_CONFIG = {widgetType: 'wm-form', hostClass: 'app-form app-login-form'};
const LIVE_FORM_CONFIG = {widgetType: 'wm-liveform', hostClass: 'panel app-panel app-liveform liveform-inline'};
const LIVE_FILTER_CONFIG = {widgetType: 'wm-livefilter', hostClass: 'panel app-panel app-livefilter clearfix liveform-inline'};

const getWidgetConfig = (isLiveForm, isLiveFilter, role) => {
    let config = WIDGET_CONFIG;
    if (isLiveForm !== null) {
        config = LIVE_FORM_CONFIG;
    } else if (isLiveFilter !== null) {
        config = LIVE_FILTER_CONFIG;
    } else if (role === 'app-login') {
        config = LOGIN_FORM_CONFIG;
    }
    return config;
};

// Generate the form field with given field definition. Add a grid column wrapper around the form field.
const setMarkupForFormField = (field, columnWidth) =>  {
    let propsTmpl = '';
    _.forEach(field, (value, key) => {
        propsTmpl = `${propsTmpl} ${key}="${value}"`;
    });
    return `<wm-gridcolumn columnwidth="${columnWidth}">
                  <wm-form-field ${propsTmpl}></wm-form-field>
            </wm-gridcolumn>`;
};

@Component({
    selector: 'form[wmForm]',
    templateUrl: './form.component.html',
    providers: [
        provideAsWidgetRef(FormComponent)
    ]
})
export class FormComponent extends StylableComponent implements OnDestroy {

    @ViewChild('dynamicForm', {read: ViewContainerRef}) dynamicFormRef: ViewContainerRef;

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
    formWidgets = {};
    filterWidgets = {};
    buttonArray = [];
    dataoutput;
    datasource;
    formdata;
    isSelected;
    prevDataValues;
    prevDataObject;
    prevformFields;
    statusMessage = {
        caption: '',
        type: ''
    };
    messagelayout;
    metadata;
    errormessage;
    primaryKey = [];
    postmessage;
    _liveTableParent;
    updateMode;
    name;
    // Live Form Methods
    clearData: Function;
    edit: Function;
    new: Function;
    cancel: Function;
    delete: Function;
    findOperationType: Function;
    save: Function;
    saveAndNew: Function;
    saveAndView: Function;
    setPrimaryKey: () => {};
    dialogId: string;
    // Live Filter
    enableemptyfilter;
    pagesize;
    result;
    pagingOptions;
    clearFilter: Function;
    applyFilter: Function;
    filter: Function;
    filterOnDefault: Function;
    execute: Function;
    onMaxDefaultValueChange: Function;

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
        this.submitForm($event);
    }

    @HostListener('reset') onReset() {
        this.reset();
    }

    constructor(
        inj: Injector,
        private fb: FormBuilder,
        private app: App,
        @SkipSelf() @Optional() public parentForm: FormComponent,
        @Attribute('beforesubmit.event') public onBeforeSubmitEvt,
        @Attribute('submit.event') public onSubmitEvt,
        @Attribute('beforerender.event') public onBeforeRenderEvt,
        @Attribute('dataset.bind') public binddataset,
        @Attribute('wmLiveForm') isLiveForm,
        @Attribute('wmLiveFilter') isLiveFilter,
        @Attribute('role') role,
        @Attribute('key') key,
        @Attribute('name') name
    ) {
        super(inj, getWidgetConfig(isLiveForm, isLiveFilter, role));

        styler(this.nativeElement, this);

        this.dialogId = this.nativeElement.getAttribute('dialogId');
        this.ngform = fb.group({});

        if (this.parentForm && this.parentForm.ngform) {
            // If parent form is present, add the current form as as formGroup for parent form
            this.parentForm.ngform.addControl(key || name, this.ngform);
        }

        // On value change in form, update the dataoutput
        const onValueChangeSubscription =  this.ngform.valueChanges
            .subscribe(this.updateDataOutput.bind(this));
        this.registerDestroyListener(() => onValueChangeSubscription.unsubscribe());
        this.elScope = this;

        this.addEventsToContext(this.context);
    }

    addEventsToContext(context) {
        context.cancel = () => this.cancel();
        context.reset = () => this.reset();
        context.save = evt => this.save(evt);
        context.saveAndNew = () => this.saveAndNew();
        context.saveAndView = () => this.saveAndView();
        context.delete = () => this.delete();
        context.new = () => this.new();
        context.edit = () => this.edit();
        context.highlightInvalidFields = () => this.highlightInvalidFields();
        context.filter = () => this.filter();
        context.clearFilter = () => this.clearFilter();
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'submit') {
            super.handleEvent(this.nativeElement, eventName, callback, locals);
        }
    }

    // This method loops through the form fields and set touched state as touched
    highlightInvalidFields() {
        _.forEach(this.ngform.controls, (control) => control.markAsTouched());
    }

    // Disable the form submit if form is in invalid state. Highlight all the invalid fields if validation type is default
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

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'captionalign':
                this.captionAlignClass = 'align-' + nv;
                break;
            case 'captionposition':
                this.setLayoutConfig();
                break;
            case 'captionwidth':
                this.setLayoutConfig();
                break;
            case 'captionsize':
                this.captionsize = nv;
                break;
            case 'novalidate':
                //  Set validation type based on the novalidate property
                this.widget.validationtype = (nv === true || nv === 'true') ? 'none' : 'default';
                break;
            case 'formdata':
                this.setFormData(nv);
                break;
            case 'defaultmode':
                if (!this.isLayoutDialog) {
                    if (nv && nv === 'Edit') {
                        this.updateMode = true;
                    } else {
                        this.updateMode = false;
                    }
                    this.isUpdateMode = this.updateMode;
                }
                break;
            case 'datasource':
                this.onDataSourceChange();
                break;
            case 'metadata':
                this.generateFormFields();
                break;
            default:
                super.onPropertyChange(key, nv, ov);
        }
    }

    // Event callbacks on success/error
    onResult(data, status, event?) {
        const params = {$event: event, $data: data, $operation: this.operationType};
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
            template = (type === 'error' && this.errormessage) ? this.errormessage : msg;
            if (this.messagelayout === 'Inline') {
                this.statusMessage = {'caption': template || '', type: type};
            } else {
                this.app.notifyApp(template, type, header);
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

    registerFormWidget(widget) {
        const name = widget.name || widget.key;
        this.formWidgets[name] = widget;
    }

    registerFormFields(formField) {
        this.formFields.push(formField);
        this.formfields[formField.key] = formField;
        this.registerFormWidget(formField);
    }

    registerActions(formAction) {
        this.buttonArray.push(formAction);
    }

    // Construct the data object merging the form fields and custom widgets data
    constructDataObject() {
        const formData     = {};
        // Get all form fields and prepare form data as key value pairs
        this.formFields.forEach(field => {
            let fieldName,
                fieldTarget,
                fieldValue;
            fieldTarget = _.split(field.key || field.target, '.');
            fieldValue = field.datavalue || field._control.value;
            fieldValue = (fieldValue === null || fieldValue === '') ? undefined : fieldValue;

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

    setFormData(data) {
        this.formFields.forEach(field => {
            field.value =  _.get(data, field.key || field.name);
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
        this.formFields.forEach(field => {
            field.value = undefined;
        });
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

        params = {$event, $formData: formData, $data: formData};

        if (this.onBeforeSubmitEvt && this.invokeEventCallback('beforesubmit', params)) {
            return;
        }

        if (this.onSubmitEvt || dataSource) {
            // If on submit is there execute it and if it returns true do service variable invoke else return
            // If its a service variable call setInput and assign form data and invoke the service
            if (dataSource) {
                performDataOperation(dataSource, formData, {})
                    .then((data) => {
                        this.onResult(data, true, $event);
                        this.toggleMessage(true, this.postmessage, 'success');
                        this.invokeEventCallback('submit', params);
                    }, (error) => {
                        template = this.errormessage || error.error || error;
                        this.onResult(error, false, $event);
                        this.toggleMessage(true, template, 'error');
                        this.invokeEventCallback('submit', params);
                    });
            } else {
                this.onResult({}, true, $event);
                this.invokeEventCallback('submit', params);
            }
        } else {
            this.onResult({}, true, $event);
        }
    }

    // Method to show/hide the panel header or footer based on the buttons
    showButtons(position) {
        return _.some(this.buttonArray, btn => {
            return _.includes(btn.position, position) && btn.updateMode === this.isUpdateMode;
        });
    }

    // Expand or collapse the panel
    expandCollapsePanel() {
        if (this.collapsible) {
            // flip the active flag
            this.expanded = !this.expanded;
        }
    }

    // On form data source change. This method is overridden by live form and live filter
    onDataSourceChange() {
    }

    // On form field default value change. This method is overridden by live form and live filter
    onFieldDefaultValueChange(field, nv) {
        field.value = parseValueByType(nv, undefined, field.widgettype);
    }

    // On form field value change. This method is overridden by live form and live filter
    onFieldValueChange() {
    }

    // Function to generate and compile the form fields from the metadata
    generateFormFields() {
        const $gridLayout = this.$element.find('.form-elements [wmlayoutgrid]:first');
        const noOfColumns = Number($gridLayout.attr('columns')) || 1;
        const columnWidth = 12 / noOfColumns;
        let fieldTemplate = '';
        let colCount = 0;
        let index;
        let userFields;
        let fields = this.metadata ? this.metadata.data || this.metadata : [];

        this.formFields = []; // empty the form fields

        if (_.isEmpty(fields)) {
            return;
        }

        if (this.onBeforeRenderEvt) {
            userFields = this.invokeEventCallback('beforerender', {$metadata: fields});
            if (userFields) {
                fields = userFields;
            }
        }

        if (!_.isArray(fields)) {
            return;
        }

        while (fields[colCount]) {
            let colTmpl = '';
            for (index = 0; index < noOfColumns; index++) {
                if (fields[colCount]) {
                    colTmpl += setMarkupForFormField(fields[colCount], columnWidth);
                }
                colCount++;
            }
            fieldTemplate += `<wm-gridrow>${colTmpl}</wm-gridrow>`;
        }

        $gridLayout.empty(); // Remove any elements from the grid
        this.dynamicFormRef.clear();

        const context = Object.create(this.viewParent);
        context.form = this;
        this.app.notify('render-resource', {
            selector: 'app-form-' + this.widgetId,
            markup: transpile(fieldTemplate),
            styles: '',
            providers: undefined,
            initFn: () => {
                setTimeout(() => {
                    $appDigest();
                }, 250);
            },
            vcRef: this.dynamicFormRef,
            $target: $gridLayout[0],
            context
        });
        this.setFormData(this.formdata);
    }

    get mode() {
        return this.operationType || this.findOperationType();
    }

    get dirty() {
        return this.ngform && this.ngform.dirty;
    }

    get invalid() {
        return this.ngform && this.ngform.invalid;
    }

    get touched() {
        return this.ngform && this.ngform.touched;
    }

    invokeActionEvent($event, expression: string) {
        const fn = $parseEvent(expression);
        fn(this.viewParent, Object.assign(this.context, {$event}));
    }
}
