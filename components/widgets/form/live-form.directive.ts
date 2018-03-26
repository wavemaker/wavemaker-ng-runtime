import { Directive, OnInit, AfterContentInit, Inject, Self } from '@angular/core';
import { registerLiveFormProps } from './form.props';
import { FormComponent } from './form.component';
import { getClonedObject, isDefined, isEmptyObject, isDateTimeType, getValidDateObject } from '@utils/utils';
import { performDataOperation } from '../../utils/data-utils';
import { $appDigest } from '@utils/watcher';

declare const _, moment;

registerLiveFormProps();

const isTimeType = field => field.widget === 'time' || (field.type === 'time' && !field.widget);
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
export class LiveFormDirective implements OnInit, AfterContentInit {

    constructor(@Self() @Inject(FormComponent) private form) {
        form.edit = this.edit.bind(this);
        form.update = this.edit.bind(this);
        form.cancel = this.cancel.bind(this);
        form.formCancel = this.cancel.bind(this);
        form.reset = this.reset.bind(this);
        form.new = this.new.bind(this);
        form.delete = this.delete.bind(this);
        form.save = this.save.bind(this);
        form.formSave = this.save.bind(this);
        form.emptyDataModel = this.emptyDataModel.bind(this);
        form.setPrevDataValues = this.setPrevDataValues.bind(this);
        form.getPrevDataValues = this.getPrevDataValues.bind(this);
        form.setPrimaryKey = this.setPrimaryKey.bind(this);
        form.setPrevformFields = this.setPrevformFields.bind(this);
        form.constructDataObject = this.constructDataObject.bind(this);
        form.changeDataObject = this.setDefaultValues.bind(this);
        form.setDefaultValues = this.setDefaultValues.bind(this);
    }

    setDefaultValues(dataObj) {
        if (!this.form.formFields || !dataObj) {
            return;
        }
        this.form.formFields.forEach((field) => {
            const value = _.get(dataObj, field.key || field.name);
            if (isTimeType(field)) {
                field.value = getValidTime(value);
            } else if (field.type === 'blob') {
                // resetFileUploadWidget(formField, true);
                // formField.href  = $scope.getBlobURL(dataObj, formField.key, value);
                // formField.value = value;
            } else {
                field.value = value;
            }
            // this.form.applyFilterOnField(field);
        });
        this.form.setPrevDataValues();
        this.form.constructDataObject();
    }

    onVariableUpdate(response, newForm, updateMode) {
        if (newForm) {
            this.form.new();
        } else {
            this.form.setDefaultValues(response);
        }
        this.form.isUpdateMode = isDefined(updateMode) ? updateMode : true;
    }

    onResult(data, status, event) {
        // TODO: Events
        // /* whether service call success or failure call this method*/
        // $scope.onResult({$event: event, $operation: $scope.operationType, $data: data});
        // if (status) {
        //     /*if service call is success call this method */
        //     Utils.triggerFn($scope.onSuccess, {$event: event, $operation: $scope.operationType, $data: data});
        // } else {
        //     /* if service call fails call this method */
        //     Utils.triggerFn($scope.onError, {$event: event, $operation: $scope.operationType, $data: data});
        // }
    }

    setPrevformFields() {
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

    getDataObject() {
        if (this.form.operationType === 'insert') {
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
        // let element;
        formFields = isPreviousData ? this.form.prevformFields : this.form.formFields;
        _.forEach(formFields, field => {
            let dateTime,
                fieldValue;
            const fieldTarget = _.split(field.key, '.');
            const fieldName = fieldTarget[0] || field.key;

            /*collect the values from the fields and construct the object*/
            /*Format the output of date time widgets to the given output format*/
            if ((field.widget && isDateTimeType(field.widget)) || isDateTimeType(field.type)) {
                if (field.value) {
                    dateTime = getValidDateObject(field.value);
                    if (field.outputformat === 'timestamp' || field.type === 'timestamp') {
                        fieldValue = field.value ? dateTime.getTime() : null;
                    } else if (field.outputformat) {
                        fieldValue = moment(dateTime).format(field.outputformat);
                    } else {
                        fieldValue = field.value;
                    }
                } else {
                    fieldValue = undefined;
                }
            } else if (field.type === 'blob') {
                fieldValue = _.get(document.forms, [formName, fieldName + '_formWidget', 'files', 0]);
            } else if (field.type === 'list') {
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
            // element = getFormElement();
            // Set the values of the widgets inside the live form (other than form fields) in form data
            // LiveWidgetUtils.setFormWidgetsValues($scope, element, dataObject);
            this.form.dataoutput = dataObject;
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

    findOperationType(variable) {
        let operation,
            isPrimary = false;
        if (variable && variable.operation && variable.operation !== 'read') {
            return variable.operation;
        }
        /*If OperationType is not set then based on the formdata object return the operation type,
            this case occurs only if the form is outside a livegrid*/
        /*If the formdata object has primary key value then return update else insert*/
        if (this.form.primaryKey && this.form.formdata) {
            /*If only one column is primary key*/
            if (this.form.primaryKey.length === 1) {
                if (this.form.formdata[this.form.primaryKey[0]]) {
                    operation = 'update';
                }
                /*If only no column is primary key*/
            } else if (this.form.primaryKey.length === 0) {
                _.forEach(this.form.formdata, (value) => {
                    if (value) {
                        isPrimary = true;
                    }
                });
                if (isPrimary) {
                    operation = 'update';
                }
                /*If multiple columns are primary key*/
            } else {
                isPrimary = _.some(this.form.primaryKey, (primaryKey) => {
                    if (this.form.formdata[primaryKey]) {
                        return true;
                    }
                });
                if (isPrimary) {
                    operation = 'update';
                }
            }
        }
        return operation || 'insert';
    }

    getPrevDataValues() {
        let prevDataValues;
        if (!this.form.formFields) {
            return;
        }
        this.form.formFields.forEach((field) => {
            prevDataValues = _.fromPairs(_.map(this.form.prevDataValues, (item) => {
                return [item.key, item.value];
            })); // Convert of array of values to an object
            field.value = prevDataValues[field.key];
        });
    }

    setPrevDataValues() {
        if (!this.form.formFields) {
            return;
        }
        this.form.prevDataValues = this.form.formFields.map((obj) => {
            return {'key': obj.key, 'value': obj.value};
        });
    }

    emptyDataModel() {
        this.form.formFields.forEach((field) => {
            if (isDefined(field)) {
                field.datavalue = '';
            }
        });
    }

    setReadonlyFields() {
        if (!this.form.formFields) {
            return;
        }
        this.form.formFields.forEach((field) => {
            if (field.primarykey && !field.isRelated) {
                field.readonly = true;
            }
        });
    }

    edit() {
        this.form.resetFormState();
        this.form.clearMessage();

        if (!this.form.isLayoutDialog) {
            if (this.form.isSelected) {
                this.form.setPrevformFields();
                this.form.setPrevDataValues();
            }
            this.form.prevDataObject = getClonedObject(this.form.rowdata || {});
        }

        this.setReadonlyFields();
        this.form.isUpdateMode = true;
        this.form.operationType = 'update';

        $appDigest();
    }

    reset() {
        // var formEle = getFormElement(),
        this.form.resetFormState();
        this.form.getPrevDataValues();
        // resetFormFields(formEle);
        if (_.isArray(this.form.formFields)) {
            this.form.formFields.forEach((field) => {
                if (field.type === 'blob') {
                    // resetFileUploadWidget(field, true);
                    // field.href = $scope.getBlobURL(prevDataValues, field.key, field.value);
                }
                // if (WM.isUndefined(field.value) && field.widget === 'autocomplete') { //Empty the query in case of autocomplete widget
                //     formEle.find('div[name=' + field.name + '] input').val('');
                // }
                // this.applyFilterOnField(field);
            });
            this.form.constructDataObject();
        }
    }

    cancel() {
        this.form.clearMessage();
        this.form.isUpdateMode = false;

        this.form.reset();
        /*Show the previous selected data*/
        if (this.form.isSelected) {
            this.form.getPrevDataValues();
        }
        this.form.isUpdateMode = false;
        // if (this.form.isLayoutDialog) {
        //     DialogService.hideDialog($scope._dialogid);
        // }
    }

    new() {
        this.form.resetFormState();
        this.form.clearMessage();
        if (this.form.isSelected && !this.form.isLayoutDialog) {
            this.form.setPrevformFields();
        }
        if (this.form.formFields && this.form.formFields.length > 0) {
            this.form.emptyDataModel();
        }
        this.form.setPrevDataValues();
        this.form.constructDataObject();
        this.form.isUpdateMode = true;
        this.form.operationType = 'insert';
    }

    delete(callBackFn) {
        this.form.resetFormState();
        this.form.operationType = 'delete';
        this.form.prevDataObject = getClonedObject(this.form.rowdata || {});
        this.form.formSave(undefined, undefined, undefined, callBackFn);
    }

    save(event?, updateMode?, newForm?, callBackFn?) {
        let data, prevData, requestData, operationType;

        operationType = this.form.operationType = this.form.operationType || this.findOperationType(this.form.variable);

        // Disable the form submit if form is in invalid state.
        if (this.form.validateFieldsOnSubmit()) {
            return;
        }

        data = this.form.constructDataObject();
        prevData = this.form.prevformFields ? this.form.constructDataObject(true) : data;

        this.form.resetFormState();

        requestData = {
            'row': data,
            'transform': true,
            'skipNotification': true
        };

        if (operationType === 'update') {
            requestData.rowData = this.form.rowdata || this.form.formdata;
            requestData.prevData = prevData;
        }

        performDataOperation(this.form.variable, requestData, {
            operationType: operationType
        }).then((response) => {
            const msg = operationType === 'insert' ? this.form.insertmessage : (operationType === 'update' ?
                this.form.updatemessage : this.form.deletemessage);
            this.onResult(response, true, event);
            this.form.toggleMessage(true, msg, 'success');
            if (this.form._liveTableParent) {
                /* highlight the current updated row */
                this.form._liveTableParent.onResult(operationType, response, newForm, updateMode);
            } else {
                /*get updated data without refreshing page*/
                this.form.variable.invoke({
                    'skipToggleState': true
                });
                this.onVariableUpdate(response, newForm, updateMode);
            }
        }, (error) => {
            this.form.toggleMessage(true, error, 'error');
        });
    }

    ngOnInit() {
    }

    ngAfterContentInit() {
    }
}

