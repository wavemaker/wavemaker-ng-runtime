import { Attribute, Component, HostBinding, HostListener, Injector, OnDestroy, SkipSelf, Optional, ViewChild, ViewContainerRef, ContentChildren, AfterContentInit, AfterViewInit, NgZone } from '@angular/core';
import { FormArray, FormBuilder, FormGroup} from '@angular/forms';

import { $appDigest, getClonedObject, getFiles, isDefined, removeClass, App, $parseEvent, debounce, DynamicComponentRefProvider, extendProto, DataSource, AbstractDialogService, DataType } from '@wm/core';
import { getFieldLayoutConfig, parseValueByType, MessageComponent, PartialDirective, performDataOperation, provideAsWidgetRef, StylableComponent, styler, WidgetRef, Live_Operations } from '@wm/components/base';
import { PrefabDirective } from '@wm/components/prefab';
import { ListComponent } from '@wm/components/data/list';

import { registerFormProps } from './form.props';

declare const _;

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
export class FormComponent extends StylableComponent implements OnDestroy, AfterContentInit, AfterViewInit {
    static  initializeProps = registerFormProps();
    @ViewChild('dynamicForm', {read: ViewContainerRef}) dynamicFormRef: ViewContainerRef;
    @ViewChild(MessageComponent) messageRef;
    // this is the reference to the component refs inside the form-group
    @ContentChildren(WidgetRef, {descendants: true}) componentRefs;

    autoupdate;
    public formlayout: any;
    public isDataSourceUpdated: boolean;
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
    formdatasource;
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

    private _debouncedUpdateFieldSource: Function = _.debounce(this.updateFieldSource, 350);
    private operationType;
    private _isLayoutDialog;
    private _dynamicContext;
    private _isGridLayoutPresent;
    private validationMessages = [];
    private formGroupName;
    private formArrayIndex;
    private bindingValue;
    private _formIsInList;

    private _debouncedSubmitForm = debounce(($event) => {
        // calling submit event in ngZone as change detection is not triggered post the submit callback and actions like notification are not shown
        this.ngZone.run(() => {
            this.submitForm($event);
        });
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

    // returns the formArray control on the parentForm.
    get parentFormArray(): FormArray {
        return this.parentForm && this.isParentList && this.parentForm.ngform.get(this.parentList.name) as FormArray;
    }

    // returns true only when closest livelist is the immediate parent of the form.
    // checks for livelist having any form elements with parentForm name.
    // If livelist is not containing any parentForm elements then it returns true.
    get isParentList() {
        if (this.parentList && this.parentForm && !isDefined(this._formIsInList)) {
            const formEle = this.$element;
            const listEle = formEle.closest('.app-livelist[name="' + this.parentList.name + '"]');
            if (listEle.length) {
                this._formIsInList = !(listEle.find('form[widget-id="' + this.parentForm.widgetId + '"]')).length;
            }
        }
        return isDefined(this._formIsInList) ? this._formIsInList : this.parentList;
    }

    constructor(
        inj: Injector,
        private fb: FormBuilder,
        private app: App,
        private dialogService: AbstractDialogService,
        private dynamicComponentProvider: DynamicComponentRefProvider,
        private ngZone: NgZone,
        @Optional() public parentList: ListComponent,
        @SkipSelf() @Optional() public parentForm: FormComponent,
        @SkipSelf() @Optional() public parentPrefab: PrefabDirective,
        @SkipSelf() @Optional() public parentPartial: PartialDirective,
        @Attribute('beforesubmit.event') public onBeforeSubmitEvt,
        @Attribute('submit.event') public onSubmitEvt,
        @Attribute('beforerender.event') public onBeforeRenderEvt,
        @Attribute('dataset.bind') public binddataset,
        @Attribute('formdata.bind') private bindformdata,
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
        this.bindingValue = key || name;

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
    }

    ngAfterViewInit() {
        if (this.parentForm && this.parentForm.ngform && this.isParentList) {
            // setting formArray control on ngform.
            if (!_.get(this.parentForm.ngform.controls, this.parentList.name)) {
                this.parentForm.ngform.setControl(this.parentList.name, new FormArray([]));
            }
            // pushing the ngform to formArray.
            this.parentFormArray.push(this.ngform);
            this.formArrayIndex = this.parentFormArray.length - 1;
        }
        this.addInnerNgFormToForm(this.bindingValue);
    }

    findOperationType() {}

    private addInnerNgFormToForm(binding) {
        if (this.parentForm && this.parentForm.ngform) {
            // handling as formArray when parent is list. Hence returning here from adding to parentForm again.
            if (this.isParentList) {
                return;
            }
            // assigning the control name of the form inside the prefab with the prefab name.
            // This will happen only when there is only one form inside prefab.
            // We do not support changing this when multiple forms are inside prefab.
            // This scenario has to be handled by end user by changing form names in prefab according to the datamodel binding.
            const parentContainer = this.parentPrefab || this.parentPartial;
            if (parentContainer) {
                let parentContentEl;
                if (this.parentPrefab) {
                    parentContentEl = parentContainer.$element.find('[wmprefabcontainer]');
                } else {
                    parentContentEl = parentContainer.$element;
                }
                /**
                 * assigning the form name to the parentContainer name i.e. partial name or perfab name by following
                 * 1. retrieving all the forms in the parentContainer
                 * 2. consider the first form
                 * 3. if this form is inside list i.e. also find if this list is also inside the parentContainer (prefab / partial)
                 * 4. then do not change the form name when form is inside list and also when there are siblings to the form
                 * 5. this means form name change applies only when there is single form (immediate child) inside the parentContainer.
                 */
                const prefabInnerForm = parentContentEl.find('form').first();
                if (_.get(prefabInnerForm[0], 'widget.widgetId') === this.widgetId) {
                    // check whether form inside prefab container is inside the list. If true, do not change the name.
                    if (!prefabInnerForm.isParentList && !prefabInnerForm.siblings('form').length) {
                        binding = _.get(parentContainer, 'name');
                    }
                }
            }
            let counter = 1;
            let innerBinding = binding;
            // Inner forms may have same names. If same name is present, append unqiue identifier
            while (this.parentForm.ngform.controls.hasOwnProperty(innerBinding)) {
                innerBinding = `${binding}_${counter}`;
                counter++;
            }
            this.formGroupName = innerBinding;
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

    // This method gets all the inner forms and validates each form.
    private setValidationOnInnerForms(validateTouch) {
        const formEle = this.getNativeElement();
        const formObjs = formEle.querySelectorAll('.app-form');
        const validationMsgs = [];
        _.forEach(formObjs, e => {
            const formInstance = (e as any).widget;
            // differentiating the validationMessages prefix based on the formGroupName
            // as the formName's are same when forms are in list
            let formName = _.get(formInstance, 'formGroupName') || formInstance.name;
            if (isDefined(formInstance.formArrayIndex)) {
                formName = formName + '[' + formInstance.formArrayIndex + ']';
            }
            let current = formInstance;
            while (_.get(current, 'parentForm')) {
                let parentName = current.parentForm.formGroupName || current.parentForm.name;
                if (current.parentForm.parentFormArray) {
                    parentName = parentName + '[' + current.parentForm.formArrayIndex + ']';
                }
                formName = parentName + '.' + formName;
                current = current.parentForm;
            }
            this.setValidationOnFields(formInstance, formName, validateTouch);
        });
    }

    /**
     * This method sets validation on formFields.
     * Applies to innerform and also sets innerform validation on parent form.
     * @param prefix contains the form name, which also includes its parents form name
     * @param {boolean} validateTouch
     */
    private setValidationOnFields(form: FormComponent, prefix: string, validateTouch?: boolean) {
        const controls = form.ngform.controls;
        const formFields = form.formFields;
        if (!formFields) {
            return;
        }
        _.forEach(controls, (v, k) => {
            const field = formFields.find(e => e.key === k);
            if (!field || (validateTouch && !v.touched)) {
                return;
            }
            // invoking the prepareValidation on both parent form and current form.
            this.prepareValidationObj(v, k, field, prefix);
            this.prepareValidationObj.call(form, v, k, field, prefix);
        });
    }

    // Assigns / updates validationMessages based on angular errors on field
    private prepareValidationObj(v, k, field, prefix) {
        const index = this.validationMessages.findIndex(e => (e.field === k && e.fullyQualifiedFormName === prefix));
        if (v.invalid) {
            if (index === -1) {
                /**
                 * field contains the fieldName
                 * value contains the field value
                 * errorType contains the list of errors
                 * message contains the validation message
                 * getElement returns the element having focus-target
                 * formName returns the name of the form
                 */
                this.validationMessages.push({
                    field: k,
                    value: field.value,
                    errorType: _.keys(v.errors),
                    message: field.validationmessage || '',
                    getElement: () => {
                        return field.$element.find('[focus-target]');
                    },
                    formName: _.last(prefix.split('.')),
                    fullyQualifiedFormName: prefix
                });
            } else {
                this.validationMessages[index].value = field.value;
                this.validationMessages[index].errorType = _.keys(v.errors);
            }
        } else if (v.valid && index > -1) {
            this.validationMessages.splice(index, 1);
        }
    }

    // This will return a object containing the error details from the list of formFields that are invalid
    private setValidationMsgs(validateTouch?: boolean) {
        if (!this.formFields.length && _.isEmpty(this.ngform.controls)) {
            return;
        }
        this.setValidationOnFields(this, this.name, validateTouch);
        this.setValidationOnInnerForms(validateTouch);
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'submit') {
            super.handleEvent(this.nativeElement, eventName, callback, locals);
        }
    }

    private updateFieldSource() {
        if (this.formdatasource && this.formdatasource.execute(DataSource.Operation.IS_API_AWARE)) {
            return;
        } else if (this.formdatasource && !this.formdatasource.twoWayBinding) {
            return;
        }
        this.formFields.forEach(formField => {
            formField.setFormWidget('datavaluesource', this.formdatasource);
            formField.setFormWidget('binddatavalue', `${this.bindformdata}.${formField.key}`);
        });
    }

    // This method loops through the form fields and highlights the invalid fields by setting state to touched
    highlightInvalidFields() {
        setTouchedState(this.ngform);
    }

    // Disable the form submit if form is in invalid state. Highlight all the invalid fields if validation type is default
    validateFieldsOnSubmit() {
        this.setValidationMsgs();
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
                // For livelist when multiselect is enabled, formdata will be array of objects. In this case consider the last object as formdata.
                _.isArray(nv) ? this.setFormData(_.last(nv)) : this.setFormData(nv);
                // if dataset on the formFields are not set as the datasourceChange is triggered before the formFields are registered.
                if (!this.isDataSourceUpdated && this.datasource) {
                    this.onDataSourceChange();
                }
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
            case 'formdatasource':
                this.onFormDataSourceChange();
                break;
            case 'metadata':
                this.generateFormFields();
                break;
            case 'dataset':
                const formFields = this.getFormFields();
                formFields.forEach(field => {
                    // notifying the dataset change to the form-field widget.
                    if (!field.isDataSetBound && _.get(field.formWidget, 'dataset$')) {
                        field.formWidget.dataset$.next();
                    }
                });
                break;
            default:
                super.onPropertyChange(key, nv, ov);
        }
    }

    // Event callbacks on success/error
    onResultCb(data, status, event?) {
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
                    this.messageRef.showMessage(this.statusMessage.caption, this.statusMessage.type);
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
        layoutConfig = getFieldLayoutConfig(this.captionwidth, this.captionposition, _.get(this.app.selectedViewPort, 'os'));
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
        this._debouncedUpdateFieldSource();
        if (this.parentForm) {
            this.parentForm.formFields.push(formField);
            this.parentForm.formfields[formField.key] = formField;
            // inner formfields are pushed to parentForm, passing current innerForm's formdata to set innerFormdata to these innerFormFields
            this.parentForm.setFormData(this.parentForm.formdata, this.formFields, this.formdata || {});
        }
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
        const formFields = this.getFormFields();
        // Get all form fields and prepare form data as key value pairs
        formFields.forEach(field => {
            let fieldName,
                fieldValue;
            fieldValue = field.datavalue || field._control.value;
            fieldValue = (fieldValue === null || fieldValue === '') ? undefined : fieldValue;

            if (field.type === 'file') {
                fieldValue = getFiles(this.name, field.key + '_formWidget', field.multiple);
            }

            fieldName = field.key || field.target || field.name;

            // on current Form, when field is innerForm field then we group these fields under new object using formGroupName as key
            // For suppose, applicantName, applicantID are formfields in currentForm
            // This form is having innerform i.e. address, these fields are listed as
            // {"applicantName": "", "applicantID": "", "address": {"street": ""}}
            if (field.form.widgetId !== this.widgetId && field.form.formGroupName) {
                const fd = _.get(formData, field.form.formGroupName, {});
                fd[fieldName] = fieldValue;
                _.set(formData, field.form.formGroupName, fd);
            } else if (field.form.isParentList) {
                // setting formdata based on formArrayIndex
                const fd = _.get(formData, field.form.parentList.name, []);
                fd[field.form.formArrayIndex] = fd[field.form.formArrayIndex] || {};
                fd[field.form.formArrayIndex][fieldName] = fieldValue;
                _.set(formData, field.form.parentList.name, fd);
            } else {
                // In case of update the field will be already present in form data
                _.set(formData, fieldName, fieldValue);
            }
        });
        this.updateFormDataOutput(formData);
        return this.dataoutput;
    }

    updateDataOutput() {
        this.constructDataObject();
        if (this.ngform.touched) {
            this.setValidationMsgs(true);
        }
    }

    // FormFields will contain all the fields in parent and inner form also.
    // This returns the formFields in the form based on the form name.
    getFormFields() {
        return _.filter(this.formFields, formField => {
            return formField.form.name === this.name;
        });
    }

    setFieldValue(field, data, innerFormdata?) {
        const key = field.key || field.name;
        // if customfield param value is not in the formdata then do not assign field value
        // as it can contain default value which will again be overridden by undefined.
        const fd = innerFormdata ? innerFormdata : data;
        if (fd) {
            if (fd.hasOwnProperty(key)) {
                field.value =  _.get(fd, key);
            } else if (_.includes(key, '.')) {
                // key contains '.' when mapping the fields to child reference i.e. childCol is having key as "parent.childCol"
                if (fd.hasOwnProperty(_.split(key, '.')[0])) {
                    field.value =  _.get(fd, key);
                }
            }
        }
        const formGroupName = field.form.formGroupName;
        /**
         * if formGroupName is defined which means field is inside the inner form
         * then set the formdata on the field's form using formGroupName
         */
        if (formGroupName && _.get(data, formGroupName)) {
            this.setFormData.call(field.form, data[formGroupName]);
        }
        // if formdata is assigned later then on propertyChangeHandler, even inner forms data also needs to be updated.
        if (_.get(field.form, 'parentFormArray')) {
            this.setFormDataFromParentFormData.call(field.form, data);
        }
    }

    setFormData(data, innerFormFields?, innerFormdata?) {
        // whereas formFields explicitly passed can contain innerform fields also.
        const formFields = innerFormFields || this.formFields;
        formFields.forEach(field => {
            this.setFieldValue(field, data, innerFormdata);
        });
        this.constructDataObject();
    }

    resetFormState() {
        // clearing the validationMessages on reset.
        if (this.validationMessages.length) {
            this.validationMessages = [];
        }
        if (!this.ngform) {
            return;
        }
        this.ngform.markAsUntouched();
        this.ngform.markAsPristine();
    }

    reset() {
        this.resetFormState();
        this.formFields.forEach(field => {
            field.value = '';
        });
        this.constructDataObject();
        this.clearMessage();
    }

    savePrevformFields() {
        this.prevformFields = getClonedObject(this.formFields.map(field => {
            return {
                'key': field.key,
                'type': field.type,
                'widgettype': field.widgettype,
                'outputformat': field.outputformat,
                'value': field.value
            };
        }));
    }

    savePrevDataValues() {
        this.prevDataValues = this.formFields.map((obj) => {
            return {'key': obj.key, 'value': obj.value};
        });
    }

    setReadonlyFields() {
        this.formFields.forEach(field => {
            field.setReadOnlyState();
        });
    }

    resetFileUploadWidget(field, skipValueSet?) {
        const $formEle = this.$element;
        $formEle.find('[name="' + field.key + '_formWidget"]').val('');
        field._control.reset();
        if (!skipValueSet) {
            field.href = '';
            field.value = null;
        }
    }

    emptyDataModel() {
        this.formFields.forEach(field => {
            if (isDefined(field)) {
                if (field.type === DataType.BLOB) {
                    this.resetFileUploadWidget(field);
                } else {
                    field.datavalue = '';
                }
            }
        });
    }

    setDefaultValues() {
        this.formFields.forEach(field => {
            this.onFieldDefaultValueChange(field, field.defaultvalue);
        });
    }

    new() {
        this.resetFormState();
        this.operationType = Live_Operations.INSERT;
        this.clearMessage();
        if (this.isSelected) {
            this.savePrevformFields();
        }
        this.emptyDataModel();
        setTimeout(() => {
            this.setDefaultValues();
            this.savePrevDataValues();
            this.constructDataObject();
        });
        this.isUpdateMode = true;
    }

    edit() {
        this.resetFormState();
        this.clearMessage();

        this.operationType = Live_Operations.UPDATE;

        if (this.isSelected) {
            this.savePrevformFields();
            this.savePrevDataValues();
        }
        this.prevDataObject = getClonedObject(this.formdata || {});

        this.setReadonlyFields();
        this.isUpdateMode = true;

        $appDigest();
    }

    submitForm($event) {
        let template;
        const dataSource = this.datasource;
        // Disable the form submit if form is in invalid state.
        if (this.validateFieldsOnSubmit()) {
            return;
        }

        const getFormData = () => {
            return getClonedObject(this.constructDataObject());
        };

        const getParams = () => {
            const formData = getFormData();
            return {$event, $formData: formData, $data: formData};
        };


        if (this.onBeforeSubmitEvt) {
            if (this.invokeEventCallback('beforesubmit', getParams()) === false) {
                return;
            } else {
                this.resetFormState();
            }
        } else {
            this.resetFormState();
        }

        if (this.onSubmitEvt || dataSource) {
            // If on submit is there execute it and if it returns true do service variable invoke else return
            // If its a service variable call setInput and assign form data and invoke the service
            if (dataSource) {
                const currentPageNum = dataSource.pagination && dataSource.pagination.number + 1;
                const operationType = this.operationType ? this.operationType : (dataSource.operationType === 'create' ? 'insert' : '');
                performDataOperation(dataSource, getFormData(), {operationType: operationType})
                    .then((data) => {
                        if (dataSource.category === 'wm.CrudVariable') {
                            this.datasource.execute(DataSource.Operation.LIST_RECORDS, {
                                'skipToggleState': true,
                                'operation': 'list',
                                'page': currentPageNum
                            });
                            if(this.dialogId) {
                                this.closeDialog();
                            }
                        }
                        return {
                            'result': data,
                            'status': true,
                            'message': this.postmessage,
                            'type': 'success'
                        };
                    }, (error) => {
                        template = this.errormessage || error.error || error;
                        $appDigest();
                        return {
                            'result': error,
                            'status': false,
                            'message': template,
                            'type': 'error'
                        };
                    }).then(response => {
                    this.toggleMessage(true, response.message, response.type);
                    this.invokeEventCallback('submit', getParams());
                    this.onResultCb(response.result, response.status, $event);
                });
            } else {
                this.invokeEventCallback('submit', getParams());
                this.onResultCb({}, true, $event);
            }
        } else {
            this.onResultCb({}, true, $event);
        }
    }

    closeDialog() {
        this.dialogService.close(this.dialogId);
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

    onDataSourceUpdate(response, newForm, updateMode) {
        if (newForm) {
            this.new();
        } else {
            this.setFormData(response);
            this.closeDialog();
        }
        this.isUpdateMode = isDefined(updateMode) ? updateMode : true;
    }

    /**
     * This method tranverses through the parent containing formdata and returns the parent formdata.
     * @param form, represents the current form instance
     * @returns {any}
     */
    getNearestParentFormData(form) {
        if (!form.parentForm) {
            return {};
        }
        if (!form.bindformdata && _.get(form.parentForm, 'formdata') && !_.isEmpty(form.parentForm.formdata)) {
            return form.parentForm.formdata;
        }
        return this.getNearestParentFormData(form.parentForm);
    }

    setFormDataFromParentFormData(formdata: any) {
        if (_.isEmpty(this.formdata) && this.parentForm && formdata) {
            /**
             * If form is inside list,
             * 1. directly applying the formdata to the formArray to update the formdata on list of forms using patchValue.
             * 2. and also setting individual formdata to the form inside each item based on formArrayIndex, when form is not bound to formdata.
             * 3. explicitly invoking formdata as formFields will contain all the formfields including innerForm's fields
             * (if we do not invoke explicitly then formFields will just contain the fields inside current form and not inner form fields)
             * 4. if childFormArrayData is not available we will check for inner form data using "formGroupName" and will set the innerform data
             * If not inside list, just set the formdata on all the formfields including innerForm fields
             */
            if (this.parentFormArray) {
                let childFormArrayData = _.get(formdata, this.parentList.name);
                if (childFormArrayData) {
                    if (!_.isArray(childFormArrayData)) {
                        childFormArrayData = [childFormArrayData];
                    }
                    this.parentFormArray.patchValue(childFormArrayData);
                    if (!this.bindformdata) {
                        this.formdata = childFormArrayData[this.formArrayIndex];
                    }
                    this.setFormData(this.formdata);
                } else if (this.isParentList && this.parentForm.formGroupName) {
                    const parentFormData = _.get(formdata, this.parentForm.formGroupName);
                    this.setFormDataFromParentFormData(parentFormData);
                }
            } else {
                this.setFormData(formdata);
            }
        }
    }

    // On form data source change. This method is overridden by live form and live filter
    onDataSourceChange() {
        if (_.get(this.formFields, 'length') && !this.bindformdata) {
            this.isDataSourceUpdated = true;
            /**
             * formdata on the parent form will be set before the inner forms are rendered.
             * Hence handling formdata on the innerForms, which might be rendered slowly (suppose prefab with form)
             * setting inner form's formdata obtained from parent formdata
             * this applies only when formdata is not given on the inner form.
             */
            const formdata = this.getNearestParentFormData(this);
            this.setFormDataFromParentFormData(formdata);
        }
    }

    // On form data source change. This method is overridden by live form and live filter
    onFormDataSourceChange() {
        this.updateFieldSource();
    }

    // On form field default value change. This method is overridden by live form and live filter
    onFieldDefaultValueChange(field, nv) {
        field.value = parseValueByType(nv, undefined, field.widgettype);
    }

    // On form field value change. This method is overridden by live form and live filter
    onFieldValueChange() {
    }

    // Function to generate and compile the form fields from the metadata
    async generateFormFields() {
        let noOfColumns;
        let $gridLayout;
        // Check if grid layout is present or not for first time
        if (_.isUndefined(this._isGridLayoutPresent)) {
            this._isGridLayoutPresent = this.$element.find('.panel-body [wmlayoutgrid]').length > 0;
        }
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
        const componentFactoryRef = await this.dynamicComponentProvider.getComponentFactoryRef(
            'app-form-dynamic-' + this.widgetId,
            fieldTemplate,
            {
                noCache: true,
                transpile: true
            });
        const component = this.dynamicFormRef.createComponent(componentFactoryRef, 0, this.inj);
        extendProto(component.instance, this._dynamicContext);
        $gridLayout[0].appendChild(component.location.nativeElement);
        this.setFormData(this.formdata);
    }

    get mode() {
        return this.operationType || this.findOperationType();
    }

    get dirty() {
        return this.ngform && this.ngform.dirty;
    }

    /**
     * This method sets the form state to pristine by internally calling angular markAsPristine method on the form
     * @param value, When true, mark only this control. When false or not supplied, marks all direct ancestors. Default is false
     * @returns {void}
     */
    markAsPristine(value: boolean = false) {
        this.ngform.markAsPristine({ onlySelf: value });
    }

    /**
     * This method sets the form state to dirty by internally calling angular markAsDirty method on the form
     * @param value, When true, mark only this control. When false or not supplied, marks all direct ancestors. Default is false
     * @returns {void}
     */
    markAsDirty(value: boolean = false) {
        this.ngform.markAsDirty({ onlySelf: value });
    }

    get invalid() {
        return this.ngform && this.ngform.invalid;
    }

    get touched() {
        return this.ngform && this.ngform.touched;
    }

    get valid() {
        return this.ngform && this.ngform.valid;
    }

    get pristine() {
        return this.ngform && this.ngform.pristine;
    }

    /**
     * This method sets the form state to touched by internally calling angular markAsTouched method on the form
     * @param value, When true, mark only this control. When false or not supplied, marks all direct ancestors. Default is false
     * @returns {void}
     */
    markAsTouched(value: boolean = false) {
        this.ngform.markAsTouched({ onlySelf: value });
    }

    /**
     * This method sets the form state to untouched by internally calling angular markAsUntouched method on the form
     * @param value, When true, mark only this control. When false or not supplied, marks all direct ancestors. Default is false
     * @returns {void}
     */
    markAsUntouched(value: boolean = false) {
        this.ngform.markAsUntouched({ onlySelf: value });
    }

    invokeActionEvent($event, expression: string) {
        const fn = $parseEvent(expression);
        fn(this.viewParent, Object.assign(this.context, {$event}));
    }

    ngOnDestroy() {
        // on form destroy, removing this form from the parentForm too.
        const controls = this.parentForm && _.get(this.parentForm, 'ngform.controls');
        if (controls) {
            // when current form is inside the list (i.e. incase of formArray).
            if (_.get(this.parentList, 'name') && controls.hasOwnProperty(this.parentList.name)) {
                this.parentForm.ngform.removeControl(this.parentList.name);
            }
            // when we have formGroupName set i.e. multiple formInstance with counter appended to formName
            if (this.formGroupName && controls.hasOwnProperty(this.formGroupName)) {
                this.parentForm.ngform.removeControl(this.formGroupName);
            } else {
                this.parentForm.ngform.removeControl(this.name);
            }
        }
    }
}
