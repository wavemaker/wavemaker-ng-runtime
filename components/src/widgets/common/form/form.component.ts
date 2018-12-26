import { Attribute, Component, HostBinding, HostListener, Injector, OnDestroy, SkipSelf, Optional, ViewChild, ViewContainerRef, ContentChildren, AfterContentInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { $appDigest, getClonedObject, getFiles, removeClass, App, $parseEvent, debounce, IDGenerator } from '@wm/core';
import { transpile } from '@wm/transpiler';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerFormProps } from './form.props';
import { getFieldLayoutConfig, parseValueByType } from '../../../utils/live-utils';
import { performDataOperation } from '../../../utils/data-utils';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { MessageComponent } from '../message/message.component';

declare const _;

registerFormProps();

const WIDGET_CONFIG = {widgetType: 'wm-form', hostClass: 'panel app-panel app-form'};
const LOGIN_FORM_CONFIG = {widgetType: 'wm-form', hostClass: 'app-form app-login-form'};
const LIVE_FORM_CONFIG = {widgetType: 'wm-liveform', hostClass: 'panel app-panel app-liveform liveform-inline'};
const LIVE_FILTER_CONFIG = {widgetType: 'wm-livefilter', hostClass: 'panel app-panel app-livefilter clearfix liveform-inline'};
const idGen = new IDGenerator('-dynamic-');

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

// Function to find out the first invalid element in form
const findInvalidElement = ($formEle, ngForm) => {
    const $ele = $formEle.find('form.ng-invalid:visible, [formControlName].ng-invalid:visible').first();
    let formObj = ngForm;
    // If element is form, find out the first invalid element in this form
    if ($ele.is('form')) {
        formObj = ngForm && ngForm.controls[$ele.attr('formControlName') || $ele.attr('name')];
        if (formObj) {
            return findInvalidElement($ele, formObj);
        }
    }
    return {
        ngForm: formObj,
        $ele: $ele
    };
};

const setTouchedState = ngForm => {
    if (ngForm.valid) {
        return;
    }
    if (ngForm.controls) {
        _.forEach(ngForm.controls, ctrl => {
            setTouchedState(ctrl);
        });
    } else {
        ngForm.markAsTouched();
    }
};

@Component({
    selector: 'form[wmForm]',
    templateUrl: './form.component.html',
    providers: [
        provideAsWidgetRef(FormComponent)
    ]
})
export class FormComponent extends StylableComponent implements OnDestroy, AfterContentInit {

    @ViewChild('dynamicForm', {read: ViewContainerRef}) dynamicFormRef: ViewContainerRef;
    @ViewChild(MessageComponent) messageRef;
    // this is the reference to the component refs inside the form-group
    @ContentChildren(WidgetRef, {descendants: true}) componentRefs;

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
    formFields = [];
    formfields = {};
    formWidgets = {};
    filterWidgets = {};
    buttonArray = [];
    dataoutput = {};
    datasource;
    formdata = {};
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
    save: Function;
    saveAndNew: Function;
    saveAndView: Function;
    setPrimaryKey: () => {};
    dialogId: string;
    // Live Filter
    enableemptyfilter;
    pagesize;
    result;
    pagination;
    clearFilter: Function;
    applyFilter: Function;
    filter: Function;
    filterOnDefault: Function;
    onMaxDefaultValueChange: Function;

    private operationType;
    private _isLayoutDialog;
    private _dynamicContext;
    private _isGridLayoutPresent;
    private validationMessages = [];

    private _debouncedSubmitForm = debounce(($event) => {
        this.submitForm($event);
    }, 250);

    set isLayoutDialog(nv) {
        if (nv) {
            removeClass(this.nativeElement, 'panel app-panel liveform-inline');
        }
        this._isLayoutDialog = nv;
    }

    get isLayoutDialog() {
        return this._isLayoutDialog;
    }

    private _isUpdateMode;
    set isUpdateMode(nv) {
        this._isUpdateMode = nv;
        this.formFields.forEach(field => {
            field.setReadOnlyState(nv);
        });
    }

    get isUpdateMode() {
        return this._isUpdateMode;
    }

    @HostBinding('action') action: string;

    @HostListener('submit', ['$event']) submit($event) {
        this._debouncedSubmitForm($event);
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

        this.isUpdateMode = true;
        this.dialogId = this.nativeElement.getAttribute('dialogId');
        this.ngform = fb.group({});
        this.addInnerNgFormToForm(key || name);

        // On value change in form, update the dataoutput
        const onValueChangeSubscription =  this.ngform.valueChanges
            .subscribe(this.updateDataOutput.bind(this));
        this.registerDestroyListener(() => onValueChangeSubscription.unsubscribe());
        this.elScope = this;

        this.addEventsToContext(this.context);
    }

    ngAfterContentInit() {
        setTimeout(() => {
            this.componentRefs.forEach(componentRef => {
                if (componentRef.name) {
                    // Register widgets inside form with formWidgets
                    this.formWidgets[componentRef.name] = componentRef;
                }
            });
        }, 250);
        this._isGridLayoutPresent = this.$element.find('.panel-body [wmlayoutgrid]').length > 0;
    }

    findOperationType() {}

    private addInnerNgFormToForm(binding) {
        if (this.parentForm && this.parentForm.ngform) {
            let counter = 1;
            let innerBinding = binding;
            // Inner forms may have same names. If same name is present, append unqiue identifier
            while (this.parentForm.ngform.controls.hasOwnProperty(innerBinding)) {
                innerBinding = `${binding}_${counter}`;
                counter++;
            }
            // If parent form is present, add the current form as as formGroup for parent form
            this.parentForm.ngform.addControl(innerBinding, this.ngform);
        }
    }

    // Expose the events on context so that they can be accessed by form actions
    private addEventsToContext(context) {
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
        context.submit = evt => this.submit(evt);
    }

    // This will return a object containing the error details from the list of formFields that are invalid
    private setValidationMsgs() {
        if (!this.formFields.length) {
            return;
        }
        _.forEach(this.ngform.controls, (v, k) => {
            const field = this.formFields.find(e => e.name === k);
            if (!field) {
                return;
            }
            const index = this.validationMessages.findIndex(e => e.field === k);
            if (v.invalid) {
                if (index === -1) {
                    /**
                     * field contains the fieldName
                     * value contains the field value
                     * errorType contains the list of errors
                     * msg contains the validation message
                     * getElement returns the element having focus-target
                     */
                    this.validationMessages.push({
                        field: k,
                        value: field.value,
                        errorType: _.keys(field.errors),
                        msg: field.validationmessage || '',
                        getElement: () => {
                            return field.$element.find('[focus-target]');
                        }
                    });
                } else {
                    this.validationMessages[index].value = field.value;
                    this.validationMessages[index].errorType = _.keys(v.errors);
                }
            } else if (v.valid && index > -1) {
                this.validationMessages.splice(index, 1);
            }
        });
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'submit') {
            super.handleEvent(this.nativeElement, eventName, callback, locals);
        }
    }

    // This method loops through the form fields and highlights the invalid fields by setting state to touched
    highlightInvalidFields() {
        setTouchedState(this.ngform);
    }

    // Disable the form submit if form is in invalid state. Highlight all the invalid fields if validation type is default
    validateFieldsOnSubmit() {
        // Disable the form submit if form is in invalid state. For delete operation, do not check the validation.
        if (this.operationType !== 'delete' && (this.validationtype === 'html' || this.validationtype === 'default')
                && this.ngform && this.ngform.invalid) {

            if (this.ngform.invalid) {
                if (this.validationtype === 'default') {
                    this.highlightInvalidFields();
                }
                // Find the first invalid untoched element and set it to touched.
                // Safari does not form validations. this will ensure that error is shown for user
                const eleForm = findInvalidElement(this.$element, this.ngform);
                const $invalidForm = eleForm.ngForm;
                let $invalidEle  = eleForm.$ele;
                $invalidEle = $invalidEle.parent().find('[focus-target]');
                if ($invalidEle.length) {
                    // on save click in page layout liveform, focus of autocomplete widget opens full-screen search.
                    if (!$invalidEle.hasClass('app-search-input')) {
                        $invalidEle.focus();
                    }
                    const ngEle = $invalidForm && $invalidForm.controls[$invalidEle.attr('formControlName') || $invalidEle.attr('name')];
                    if (ngEle && ngEle.markAsTouched) {
                        ngEle.markAsTouched();
                    }
                    $appDigest();
                    return true;
                }
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

    // Display or hide the inline message/ toaster
    toggleMessage(show: boolean, msg?: string, type?: string, header?: string) {
        let template;
        if (show && msg) {
            template = (type === 'error' && this.errormessage) ? this.errormessage : msg;
            if (this.messagelayout === 'Inline') {
                this.statusMessage = {'caption': template || '', type: type};
                if (this.messageRef) {
                    this.messageRef.showMessage();
                }
            } else {
                this.app.notifyApp(template, type, header);
            }
        } else {
            this.statusMessage.caption = '';
        }
    }

    // Hide the inline message/ toaster
    clearMessage() {
        this.toggleMessage(false);
    }

    // Set the classes on the form based on the captionposition and captionwidth properties
    private setLayoutConfig() {
        let layoutConfig;
        layoutConfig = getFieldLayoutConfig(this.captionwidth, this.captionposition,  _.get(this.app.selectedViewPort, 'os'));
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

    // Update the dataoutput whenever there is a change in inside form widget value
    updateFormDataOutput(dataObject) {
        // Set the values of the widgets inside the live form (other than form fields) in form data
        _.forEach(this.ngform.value, (val, key) => {
            if (!_.find(this.formFields, {key})) {
                dataObject[key] = val;
            }
        });
        this.dataoutput = dataObject;
    }

    // Construct the data object merging the form fields and custom widgets data
    constructDataObject() {
        const formData     = {};
        // Get all form fields and prepare form data as key value pairs
        this.formFields.forEach(field => {
            let fieldName,
                fieldValue;
            fieldValue = field.datavalue || field._control.value;
            fieldValue = (fieldValue === null || fieldValue === '') ? undefined : fieldValue;

            if (field.type === 'file') {
                fieldValue = getFiles(this.name, field.key + '_formWidget', field.multiple);
            }

            fieldName = field.key || field.target || field.name;
            // In case of update the field will be already present in form data
            _.set(formData, fieldName, fieldValue);
        });
        this.updateFormDataOutput(formData);
        return this.dataoutput;
    }

    updateDataOutput() {
        this.constructDataObject();
        this.setValidationMsgs();
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
            field.value = '';
        });
        this.constructDataObject();
        this.clearMessage();
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

        if (this.onBeforeSubmitEvt && (this.invokeEventCallback('beforesubmit', params) === false)) {
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
                        $appDigest();
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
        let noOfColumns;
        let $gridLayout;
        if (this._isGridLayoutPresent) {
            $gridLayout = this.$element.find('.form-elements [wmlayoutgrid]:first');
            noOfColumns = Number($gridLayout.attr('columns')) || 1;
        } else {
            $gridLayout = this.$element.find('.form-elements .dynamic-form-container');
            if (!$gridLayout.length) {
                this.$element.find('.form-elements').prepend('<div class="dynamic-form-container"></div>');
                $gridLayout = this.$element.find('.form-elements .dynamic-form-container');
            }
            noOfColumns = 1;
        }
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

        if (!this._isGridLayoutPresent) {
            fieldTemplate = `<wm-layoutgrid>${fieldTemplate}</wm-layoutgrid>`;
        }

        this.dynamicFormRef.clear();

        if (!this._dynamicContext) {
            this._dynamicContext = Object.create(this.viewParent);
            this._dynamicContext.form = this;
        }

        this.app.notify('render-resource', {
            selector: 'app-form-' + this.widgetId + idGen.nextUid(),
            markup: transpile(fieldTemplate),
            styles: '',
            providers: undefined,
            initFn: () => {},
            vcRef: this.dynamicFormRef,
            $target: $gridLayout[0],
            context: this._dynamicContext
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
