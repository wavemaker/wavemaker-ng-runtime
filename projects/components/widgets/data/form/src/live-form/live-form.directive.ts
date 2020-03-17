import { Directive, Inject, Optional, Self, Attribute } from '@angular/core';

import { $appDigest, AbstractDialogService, DataSource, DataType, debounce, getClonedObject, getFiles, getValidDateObject, isDateTimeType, isDefined, isEmptyObject } from '@wm/core';
import { ALLFIELDS, applyFilterOnField, fetchRelatedFieldData, getDistinctValuesForField, isDataSetWidget, Live_Operations, parseValueByType, performDataOperation, ToDatePipe } from '@wm/components/base';
import { LiveTableComponent } from '@wm/components/data/live-table';

import { registerLiveFormProps } from '../form.props';
import { FormComponent } from '../form.component';

declare const _;

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
    static  initializeProps = registerLiveFormProps();
    private _debouncedSavePrevDataValues = debounce(() => {
        this.savePrevDataValues();
    }, 250);

    constructor(
        @Self() @Inject(FormComponent) private form,
        @Optional() liveTable: LiveTableComponent,
        public datePipe: ToDatePipe,
        private dialogService: AbstractDialogService,
        @Attribute('formlayout') formlayout: string
    ) {
        // If parent live table is present and this form is first child of live table, set this form instance on livetable
        if (liveTable && !this.form.parentForm) {
            this.form._liveTableParent = liveTable;
            this.form.isLayoutDialog = liveTable.isLayoutDialog;
            liveTable.onFormReady(this.form);
        } else {
            this.form.isLayoutDialog = formlayout === 'dialog';
        }
        // CUD operations
        form.cancel = this.cancel.bind(this);
        form.reset = this.reset.bind(this);
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
        if (_.get(this.form.formFields, 'length')) {
            this.form.isDataSourceUpdated = true;
        }
        const formFields = this.form.getFormFields();
        formFields.forEach(field => {
            if (!field.isDataSetBound && isDataSetWidget(field.widgettype)) {
                if (field['is-related']) {
                    field.isDataSetBound = true;
                    fetchRelatedFieldData(this.form.datasource, field.widget, {
                        relatedField: field.key,
                        datafield: ALLFIELDS,
                        widget: 'widgettype',
                    });
                } else {
                    getDistinctValuesForField(this.form.datasource, field.widget, {
                        widget: 'widgettype',
                        enableemptyfilter: this.form.enableemptyfilter
                    });
                    applyFilterOnField(this.form.datasource, field.widget, formFields, field.value, {isFirst: true});
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
        this._debouncedSavePrevDataValues();
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

    setFormData(dataObj, formFields?) {
        if (!dataObj) {
            return;
        }
        formFields = formFields || this.form.formFields;
        formFields.forEach(field => {
            const value = _.get(dataObj, field.key || field.name);
            if (isTimeType(field)) {
                field.value = getValidTime(value);
            } else if (field.type === DataType.BLOB) {
                this.form.resetFileUploadWidget(field, true);
                field.href  = this.getBlobURL(dataObj, field.key, value);
                field.value = _.isString(value) ? '' : value;
            } else {
                this.form.setFieldValue(field, dataObj);
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
            this.closeDialog();
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
        formFields = isPreviousData ? this.form.prevformFields : this.form.getFormFields();
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
                fieldValue = (field.value === null || field.value === '') ? undefined : field.value;
            }

            if (fieldTarget.length === 1) {
                dataObject[fieldName] = fieldValue;
            } else {
                dataObject[fieldName] = dataObject[fieldName] || {};
                dataObject[fieldName][fieldTarget[1]] = fieldValue;
            }
        });
        if (!isPreviousData) {
            this.form.updateFormDataOutput(dataObject);
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
        const sourceOperation = this.form.datasource && this.form.datasource.execute(DataSource.Operation.GET_OPERATION_TYPE);
        if (sourceOperation && sourceOperation !== 'read') {
            return sourceOperation;
        }
        /*If OperationType is not set then based on the formdata object return the operation type,
            this case occurs only if the form is outside a livegrid*/
        /*If the formdata object has primary key value then return update else insert*/
        if (this.form.primaryKey && !_.isEmpty(this.form.formdata)) {
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
            field.resetDisplayInput();
        });
        return prevDataValues;
    }

    savePrevDataValues() {
        this.form.prevDataValues = this.form.formFields.map((obj) => {
            return {'key': obj.key, 'value': obj.value};
        });
    }

    clearData() {
        this.form.toggleMessage(false);
        this.form.emptyDataModel();
    }

    setReadonlyFields() {
        this.form.formFields.forEach(field => {
            field.setReadOnlyState();
        });
    }

    reset() {
        let prevDataValues;
        this.form.resetFormState();
        prevDataValues = this.getPrevDataValues();
        this.form.formFields.forEach(field => {
            if (field.type === DataType.BLOB) {
                this.form.resetFileUploadWidget(field, true);
                field.href = this.getBlobURL(prevDataValues, field.key, field.value);
            }
        });
        this.form.constructDataObject();
    }

    closeDialog() {
        if (this.form.isLayoutDialog) {
            this.dialogService.close(this.form.dialogId);
        }
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
        this.closeDialog();
        if (this.form._liveTableParent) {
            this.form._liveTableParent.onCancel();
        }
        $appDigest();
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
        if (!this.form.datasource) {
            return;
        }
        let data, prevData, operationType, isValid;
        const requestData: any = {};

        operationType = this.form.operationType = this.form.operationType || this.findOperationType();

        // Disable the form submit if form is in invalid state.
        if (this.form.validateFieldsOnSubmit()) {
            return;
        }

        data = getClonedObject(this.form.constructDataObject());
        prevData = this.form.prevformFields ? this.form.constructDataObject(true) : data;

        try {
            isValid = this.form.invokeEventCallback('beforeservicecall', {$event: event, $operation: this.form.operationType, $data: data, options: requestData});
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
            $appDigest();
            return;
        }

        requestData.row = data;
        requestData.transform = true;
        requestData.skipNotification = true;

        if (operationType === Live_Operations.UPDATE) {
            requestData.rowData = this.form.formdata;
            requestData.prevData = prevData;
        }

        performDataOperation(this.form.datasource, requestData, {
            operationType: operationType
        }).then((response) => {
            const msg = operationType === Live_Operations.INSERT ? this.form.insertmessage : (operationType === Live_Operations.UPDATE ?
                this.form.updatemessage : this.form.deletemessage);
            let result;

            if (operationType === Live_Operations.DELETE) {
                result = requestData.row;
                this.emptyDataModel();
                this.form.prevDataValues = [];
                this.form.isSelected = false;
            } else {
                result = response;
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
            return {
                'result': result,
                'status': true
            };
        }, (error) => {
            this.form.toggleMessage(true, error, 'error');
            $appDigest();
            return {
                'result': error,
                'status': false
            };
        }).then(response => {
            // reset the form to pristine state
            this.form.resetFormState();
            this.form.onResultCb(response.result, response.status, event);
        });


    }
}
