import { Directive, Inject, Optional, Self } from '@angular/core';

import { $appDigest, AbstractDialogService, DataSource, DataType, getClonedObject, getFiles, getValidDateObject, isDateTimeType, isDefined, isEmptyObject } from '@wm/core';

import { registerLiveFormProps } from './form.props';
import { FormComponent } from './form.component';
import { ALLFIELDS, applyFilterOnField, fetchRelatedFieldData, getDistinctValuesForField, Live_Operations, performDataOperation } from '../../../utils/data-utils';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { parseValueByType } from '../../../utils/live-utils';
import { isDataSetWidget } from '../../../utils/widget-utils';
import { LiveTableComponent } from '../live-table/live-table.component';

declare const _;

registerLiveFormProps();

const isTimeType = field => field.widgettype === DataType.TIME || (field.type === DataType.TIME && !field.widgettype);
const getValidTime = val => {
    if (val) {
        const date = (new Date()).toDateString();
        return (new Date(`${date} ${val}`)).getTime();
    }
    return undefined;
};

@Directive({
    selector: '[wmLiveForm]'
})
export class LiveFormDirective {

    constructor(
        @Self() @Inject(FormComponent) private form,
        @Optional() liveTable: LiveTableComponent,
        public datePipe: ToDatePipe,
        private dialogService: AbstractDialogService
    ) {

        if (liveTable) {
            this.form._liveTableParent = liveTable;
            this.form.isLayoutDialog = liveTable.isLayoutDialog;
            liveTable.onFormReady(this.form);
        }
        // CUD operations
        form.edit = this.edit.bind(this);
        form.cancel = this.cancel.bind(this);
        form.reset = this.reset.bind(this);
        form.new = this.new.bind(this);
        form.delete = this.delete.bind(this);
        form.save = this.save.bind(this);
        form.saveAndNew = this.saveAndNew.bind(this);
        form.saveAndView = this.saveAndView.bind(this);

        form.setPrimaryKey = this.setPrimaryKey.bind(this);
        form.constructDataObject = this.constructDataObject.bind(this);
        form.changeDataObject = this.setFormData.bind(this);
        form.setFormData = this.setFormData.bind(this);
        form.findOperationType = this.findOperationType.bind(this);
        form.clearData = this.clearData.bind(this);
        form.onFieldDefaultValueChange = this.onFieldDefaultValueChange.bind(this);
        form.onDataSourceChange = this.onDataSourceChange.bind(this);
        form.onFieldValueChange = this.onFieldValueChange.bind(this);
        form.submitForm = this.submitForm.bind(this);
    }

    onDataSourceChange() {
        this.form.formFields.forEach(field => {
            if (isDataSetWidget(field.widgettype)) {
                if (field['is-related']) {
                    field.isDataSetBound = true;
                    fetchRelatedFieldData(this.form.datasource, field.widget, {
                        relatedField: field.key,
                        datafield: ALLFIELDS
                    });
                } else {
                    getDistinctValuesForField(this.form.datasource, field.widget, {
                        widget: 'widgettype',
                        enableemptyfilter: this.form.enableemptyfilter
                    });
                    applyFilterOnField(this.form.datasource, field.widget, this.form.formFields, field.value, {isFirst: true});
                }
            }
        });
    }

    onFieldDefaultValueChange(field, nv) {
        // In Edit, do  not set default values
        if (this.form.operationType === 'update') {
            return;
        }
        // Set the default value only if it exists.
        if (isDefined(nv) && nv !== null && nv !== '' && nv !== 'null') {
            field.value = parseValueByType(nv, field.type, field.widgettype);
        } else {
            field.value = undefined;
        }
        /*If the field is primary but is assigned set readonly false.
         Assigned is where the user inputs the value while a new entry.
         This is not editable(in update mode) once entry is successful*/
        if (field.readonly && field['primary-key'] && field.generator === 'assigned') {
            field.widget.readonly = false;
        }
        this.savePrevDataValues();
    }

    onFieldValueChange(field, nv) {
        applyFilterOnField(this.form.datasource, field.widget, this.form.formFields, nv);
    }

    getBlobURL(dataObj, key, value) {
        let href = '';
        let primaryKeys;
        let primaryKey;
        if (value === null || value === undefined || !this.form.datasource) {
            return href;
        }
        primaryKeys = this.form.datasource.execute(DataSource.Operation.GET_PRIMARY_KEY) || [];
        primaryKey  = dataObj[primaryKeys[0]];
        // TODO: Handle mobile case
        // if (CONSTANTS.hasCordova && CONSTANTS.isRunMode) {
        //     href += $rootScope.project.deployedUrl;
        // }
        href += this.form.datasource.execute(DataSource.Operation.GET_BLOB_URL, {
            primaryValue: primaryKey,
            columnName: key
        });
        href += '?' + Math.random();
        return href;
    }

    resetFileUploadWidget(field, skipValueSet?) {
        const $formEle = this.form.$element;
        $formEle.find('[name="' + field.key + '_formWidget"]').val('');
        field._control.reset();
        if (!skipValueSet) {
            field.href = '';
            field.value = null;
        }
    }

    setDefaultValues() {
        this.form.formFields.forEach(field => {
            this.onFieldDefaultValueChange(field, field.defaultvalue);
        });
    }

    setFormData(dataObj) {
        if (!dataObj) {
            return;
        }
        this.form.formFields.forEach(field => {
            const value = _.get(dataObj, field.key || field.name);
            if (isTimeType(field)) {
                field.value = getValidTime(value);
            } else if (field.type === DataType.BLOB) {
                this.resetFileUploadWidget(field, true);
                field.href  = this.getBlobURL(dataObj, field.key, value);
                field.value = _.isString(value) ? '' : value;
            } else {
                field.value = value;
            }
        });
        this.savePrevDataValues();
        this.form.constructDataObject();
    }

    onDataSourceUpdate(response, newForm, updateMode) {
        if (newForm) {
            this.form.new();
        } else {
            this.form.setFormData(response);
        }
        this.form.isUpdateMode = isDefined(updateMode) ? updateMode : true;
    }

    savePrevformFields() {
        this.form.prevformFields = getClonedObject(this.form.formFields.map(field => {
            return {
                'key': field.key,
                'type': field.type,
                'widgettype': field.widgettype,
                'outputformat': field.outputformat,
                'value': field.value
            };
        }));
    }

    getPrevformFields() {
        this.form.formFields.map(field => {
            const prevField = this.form.prevformFields.find(pField => pField.key === field.key);
            field.value = prevField.value;
        });
    }

    getDataObject() {
        if (this.form.operationType === Live_Operations.INSERT) {
            return {};
        }
        if (isDefined(this.form.prevDataObject) && !isEmptyObject(this.form.prevDataObject)) {
            return getClonedObject(this.form.prevDataObject);
        }
        return getClonedObject(this.form.formdata || {});
    }

    constructDataObject(isPreviousData?) {
        const dataObject = this.getDataObject();
        const formName = this.form.name;
        let formFields;
        formFields = isPreviousData ? this.form.prevformFields : this.form.formFields;
        formFields.forEach(field => {
            let dateTime,
                fieldValue;
            const fieldTarget = _.split(field.key, '.');
            const fieldName = fieldTarget[0] || field.key;

            /*collect the values from the fields and construct the object*/
            /*Format the output of date time widgets to the given output format*/
            if ((field.widgettype && isDateTimeType(field.widgettype)) || isDateTimeType(field.type)) {
                if (field.value) {
                    dateTime = getValidDateObject(field.value);
                    if (field.outputformat === DataType.TIMESTAMP || field.type === DataType.TIMESTAMP) {
                        fieldValue = field.value ? dateTime : null;
                    } else if (field.outputformat) {
                        fieldValue = this.datePipe.transform(dateTime, field.outputformat);
                    } else {
                        fieldValue = field.value;
                    }
                } else {
                    fieldValue = undefined;
                }
            } else if (field.type === DataType.BLOB) {
                fieldValue = getFiles(formName, fieldName + '_formWidget', field.multiple);
            } else if (field.type === DataType.LIST) {
                fieldValue = field.value || undefined;
            } else {
                fieldValue = field.value;
            }

            if (fieldTarget.length === 1) {
                dataObject[fieldName] = fieldValue;
            } else {
                dataObject[fieldName] = dataObject[fieldName] || {};
                dataObject[fieldName][fieldTarget[1]] = fieldValue;
            }
        });
        if (!isPreviousData) {
            // Set the values of the widgets inside the live form (other than form fields) in form data
            this.form.dataoutput = {...this.form.ngform.value, ...dataObject};
            return this.form.dataoutput;
        }
        return dataObject;
    }

    setPrimaryKey(fieldName) {
        /*Store the primary key of data*/
        this.form.primaryKey = this.form.primaryKey || [];
        if (this.form.primaryKey.indexOf(fieldName) === -1) {
            this.form.primaryKey.push(fieldName);
        }
    }

    findOperationType() {
        let operation;
        let isPrimary = false;
        const sourceOperation = this.form.datasource.execute(DataSource.Operation.GET_OPERATION_TYPE);
        if (sourceOperation && sourceOperation !== 'read') {
            return sourceOperation;
        }
        /*If OperationType is not set then based on the formdata object return the operation type,
            this case occurs only if the form is outside a livegrid*/
        /*If the formdata object has primary key value then return update else insert*/
        if (this.form.primaryKey && this.form.formdata) {
            /*If only one column is primary key*/
            if (this.form.primaryKey.length === 1) {
                if (this.form.formdata[this.form.primaryKey[0]]) {
                    operation = Live_Operations.UPDATE;
                }
                /*If only no column is primary key*/
            } else if (this.form.primaryKey.length === 0) {
                _.forEach(this.form.formdata, (value) => {
                    if (value) {
                        isPrimary = true;
                    }
                });
                if (isPrimary) {
                    operation = Live_Operations.UPDATE;
                }
                /*If multiple columns are primary key*/
            } else {
                isPrimary = _.some(this.form.primaryKey, (primaryKey) => {
                    if (this.form.formdata[primaryKey]) {
                        return true;
                    }
                });
                if (isPrimary) {
                    operation = Live_Operations.UPDATE;
                }
            }
        }
        return operation || Live_Operations.INSERT;
    }

    getPrevDataValues() {
        const prevDataValues = _.fromPairs(_.map(this.form.prevDataValues, (item) => {
            return [item.key, item.value];
        })); // Convert of array of values to an object
        this.form.formFields.forEach(field => {
            field.value = prevDataValues[field.key] || '';
        });
        return prevDataValues;
    }

    savePrevDataValues() {
        this.form.prevDataValues = this.form.formFields.map((obj) => {
            return {'key': obj.key, 'value': obj.value};
        });
    }

    emptyDataModel() {
        this.form.formFields.forEach(field => {
            if (isDefined(field)) {
                if (field.type === DataType.BLOB) {
                    this.resetFileUploadWidget(field);
                } else {
                    field.datavalue = '';
                }
            }
        });
    }

    clearData() {
        this.form.toggleMessage(false);
        this.emptyDataModel();
    }

    setReadonlyFields() {
        this.form.formFields.forEach(field => {
            if (field.primarykey && !field.isRelated) {
                field.readonly = true;
            }
        });
    }

    edit() {
        this.form.resetFormState();
        this.form.clearMessage();

        this.form.operationType = Live_Operations.UPDATE;

        if (this.form.isSelected) {
            this.savePrevformFields();
            this.savePrevDataValues();
        }
        this.form.prevDataObject = getClonedObject(this.form.formdata || {});

        this.setReadonlyFields();
        this.form.isUpdateMode = true;

        $appDigest();
    }

    reset() {
        let prevDataValues;
        this.form.resetFormState();
        prevDataValues = this.getPrevDataValues();
        this.form.formFields.forEach(field => {
            if (field.type === DataType.BLOB) {
                this.resetFileUploadWidget(field, true);
                field.href = this.getBlobURL(prevDataValues, field.key, field.value);
            }
        });
        this.form.constructDataObject();
    }

    cancel() {
        this.form.clearMessage();
        this.form.isUpdateMode = false;

        this.form.reset();
        /*Show the previous selected data*/
        if (this.form.isSelected) {
            this.getPrevformFields();
        }
        this.form.isUpdateMode = false;
        if (this.form.isLayoutDialog) {
             this.dialogService.close(this.form.dialogId);
        }
        if (this.form._liveTableParent) {
            this.form._liveTableParent.onCancel();
        }
        $appDigest();
    }

    new() {
        this.form.resetFormState();
        this.form.operationType = Live_Operations.INSERT;
        this.form.clearMessage();
        if (this.form.isSelected) {
            this.savePrevformFields();
        }
        this.emptyDataModel();
        setTimeout(() => {
            this.setDefaultValues();
            this.savePrevDataValues();
            this.form.constructDataObject();
        });
        this.form.isUpdateMode = true;
    }

    delete(callBackFn) {
        this.form.resetFormState();
        this.form.operationType = Live_Operations.DELETE;
        this.form.prevDataObject = getClonedObject(this.form.formdata || {});
        this.form.save(undefined, undefined, undefined, callBackFn);
    }

    // Function use to save the form and open new form after save
    saveAndNew() {
        this.save(undefined, true, true);
    }
    // Function use to save the form and open new form after save
    saveAndView() {
        this.save(undefined, false);
    }

    submitForm($event) {
        this.save($event);
    }

    save(event?, updateMode?, newForm?) {
        let data, prevData, requestData, operationType, isValid;

        operationType = this.form.operationType = this.form.operationType || this.findOperationType();

        // Disable the form submit if form is in invalid state.
        if (this.form.validateFieldsOnSubmit()) {
            return;
        }

        data = getClonedObject(this.form.constructDataObject());
        prevData = this.form.prevformFields ? this.form.constructDataObject(true) : data;

        try {
            isValid = this.form.invokeEventCallback('beforeservicecall', {$event: event, $operation: this.form.operationType, $data: data});
            if (isValid === false) {
                return;
            }
            if (isValid && isValid.error) {
                this.form.toggleMessage(true, isValid.error, 'error');
                return;
            }
        } catch (err) {
            if (err.message === 'Abort') {
                return;
            }
        }

        // If operation is update, form is not touched and current data and previous data is same, Show no changes detected message
        if (this.form.operationType === Live_Operations.UPDATE && this.form.ngform && this.form.ngform.pristine &&
                (this.form.isSelected && _.isEqual(data, prevData))) {
            this.form.toggleMessage(true, this.form.appLocale.MESSAGE_NO_CHANGES, 'info', '');
            return;
        }

        this.form.resetFormState();

        requestData = {
            'row': data,
            'transform': true,
            'skipNotification': true
        };

        if (operationType === Live_Operations.UPDATE) {
            requestData.rowData = this.form.formdata;
            requestData.prevData = prevData;
        }

        performDataOperation(this.form.datasource, requestData, {
            operationType: operationType
        }).then((response) => {
            const msg = operationType === Live_Operations.INSERT ? this.form.insertmessage : (operationType === Live_Operations.UPDATE ?
                this.form.updatemessage : this.form.deletemessage);

            if (operationType === Live_Operations.DELETE) {
                this.form.onResult(requestData.row, true, event);
                this.emptyDataModel();
                this.form.prevDataValues = [];
                this.form.isSelected = false;
            } else {
                this.form.onResult(response, true, event);
            }

            this.form.toggleMessage(true, msg, 'success');
            if (this.form._liveTableParent) {
                // highlight the current updated row
                this.form._liveTableParent.onResult(operationType, response, newForm, updateMode);
            } else {
                /*get updated data without refreshing page*/
                this.form.datasource.execute(DataSource.Operation.LIST_RECORDS, {
                    'skipToggleState': true
                });
                this.onDataSourceUpdate(response, newForm, updateMode);
            }
        }, (error) => {
            this.form.onResult(error, false, event);
            this.form.toggleMessage(true, error, 'error');
        });
    }
}

