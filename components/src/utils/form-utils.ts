import { isDefined, isEqualWithFields } from '@wm/core';

import { getEvaluatedData, getObjValueByKey } from './widget-utils';

import { ALLFIELDS } from './data-utils';

declare const _;

/**
 * function to get the ordered dataset based on the given orderby
 */
export const getOrderedDataSet = (dataSet: any, orderBy: string) => {
    if (!orderBy) {
        return _.cloneDeep(dataSet);
    }

    // The order by only works when the dataset contains list of objects.
    const items = orderBy.split(','),
        fields = [],
        directions = [];
    items.forEach(obj => {
        const item = obj.split(':');
        fields.push(item[0]);
        directions.push(item[1]);
    });
    return _.orderBy(dataSet, fields, directions);
};

/**
 * Returns an array of object, each object contain the DataSetItem whose key, value, label are extracted from object keys.
 */
export const transformDataWithKeys = (dataSet: any) => {
    const data: DataSetItem[] = [];
    // if the dataset is instance of object (not an array) or the first item in the dataset array is an object,
    // then we extract the keys from the object and prepare the dataset items.
    if (_.isObject(dataSet[0]) || (_.isObject(dataSet) && !(dataSet instanceof Array))) {
        // getting keys of the object
        const objectKeys = Object.keys(dataSet[0] || dataSet);
        _.forEach(objectKeys, (objKey, index) => {
            data.push({'key': objKey, 'label': objKey, 'value': objKey, 'index': index + 1});
        });
    }

    return data;
};

// This function return always an object containing dataset details.
export const convertDataToObject = (dataResult) => {
    // TODO: [bandhavya] remove check for data property
    // Check for data to get data for livevariable.
    dataResult = dataResult.hasOwnProperty('data') ? dataResult.data : dataResult;

    if (_.isString(dataResult)) {
        dataResult = _.split(dataResult, ',').map(str => str.trim());
    }

    return dataResult;
};

/**
 * The first step in datasetItems creation is data transformation:
 *
 * The dataset can contain one of the following formats and each of them to be converted to the given format;
 *
 * 1) The comma separated string..eg: A,B,C => [{ key: 'A', value: 'A'}, { key: 'B', value: 'B'}, { key: 'C', value: 'C'}]
 * 2) The array of values eg: [1,2,3] => [{ key: 1, value: 1}, { key: 2, value: 2}, { key: 3, value: 3}]
 * 3) an object eg: {name: 'A', age: 20} => [ {key: 'name', value: 'A'}, {key: 'age', value: 20}]
 * 4) an array of objects...eg: [ {name: 'A', age: 20}, {name: 'B', age: 20}] ==> returns [{key: _DATAFIELD_, value: _DISPLAYFIELD, label: _DISPLAYVALUE}]
 */
export const transformData = (dataSet: any, myDataField: string, displayOptions, startIndex?: number): Array<DataSetItem> => {
    const data = [];
    dataSet = convertDataToObject(dataSet);

    if (_.isString(dataSet)) {
        dataSet = dataSet.split(',').map(str => str.trim());
        dataSet.forEach((option, index) => {
            data.push({'key': option, 'value': option, 'label': option, 'index': index + 1});
        });
    } else if (_.isArray(dataSet) && !_.isObject(dataSet[0])) { // array of primitive values only
        dataSet.forEach((option, index) => {
            data.push({'key': option, 'value': option, 'label': option, 'index': index + 1});
        });
    } else if (!(dataSet instanceof Array) && dataSet instanceof Object) {
        const i = 0;
        _.forEach(dataSet, (value, key) => {
            data.push({'key': _.trim(key), 'value': key, 'label': value, 'index': i + 1});
        });
    } else {
        if (!myDataField) { // consider the datafield as 'ALLFIELDS' when datafield is not given.
            myDataField = ALLFIELDS;
        }

        const myDisplayImgSrc = displayOptions.displayImgSrc;

        dataSet.forEach((option, index) => {
            // startIndex is the index of the next new item.
            if (!_.isUndefined(startIndex)) {
                index = index + startIndex;
            }
            const key = myDataField === ALLFIELDS ? index : getObjValueByKey(option, myDataField);

            // Omit all the items whose datafield (key) is null or undefined.
            if (!_.isUndefined(key) && !_.isNull(key)) {
                const label = getEvaluatedData(option, {
                    field: displayOptions.displayField,
                    expression: displayOptions.displayExpr,
                    bindExpression: displayOptions.bindDisplayExpr
                });
                const dataSetItem = {
                    key: key,
                    label: label,
                    value: myDataField === ALLFIELDS ? option : key,
                    index: index + 1
                };
                if (myDisplayImgSrc) {
                    dataSetItem['imgSrc'] = getEvaluatedData(option, {
                        expression: displayOptions.displayImgSrc,
                        bindExpression: displayOptions.bindDisplayImgSrc
                    });
                }
                data.push(dataSetItem);
            }
        });
    }
    return data;
};


/**
 * This function iterates over the modelProxy and returns the model value. Here model is array of values.
 * If datafield is ALLFIELDS, modelProxy is 0, then model will be retrieved from dataObject in displayOptions
 * If datafield is other than ALLFIELDS, the modelProxy and model will be retrieved from key in displayOptions
 */
export const assignModelForMultiSelect = (displayOptions: any, datafield: any, modelProxy: any, _model_: any, _isChangedManually: boolean, _dataVal: any, callback?: (obj: any) => void) => {
    let selectedOption;
    const selectedCheckboxValue = modelProxy;

    // ModelProxy is undefined or [] , then update the _dataVal which can be used when latest dataset is obtained.
    if (!_isChangedManually && !_.isUndefined(_model_) && (_.isUndefined(selectedCheckboxValue) || (_.isArray(selectedCheckboxValue) && !selectedCheckboxValue.length))) {
        _dataVal = _model_;
        _model_ = selectedCheckboxValue;

        // todo  remove this prop.
        // this._ngModelOldVal = _dataVal;
    } else if (selectedCheckboxValue) {
        _model_ = [];
        selectedCheckboxValue.forEach(value => {
            selectedOption = _.find(displayOptions, {key: value});
            if (selectedOption) {
                selectedOption.isChecked = true;
            }
            if (selectedOption && datafield === 'All Fields') {
                _model_.push(selectedOption.dataObject);
            } else {
                _model_.push(value);
            }
        });
    }

    // clear _dataVal when model is defined.
    if (_model_ && _model_.length && !_.isUndefined(_dataVal)) {
        _dataVal = undefined;
    }
    callback({'_dataVal': _dataVal, 'model': _model_});
};

/**
 * function to update the checked values, which selects/ de-selects the values in radioset/ checkboxset
 */
export const updatedCheckedValues = (displayOptions: any[], _model_: any, modelProxy: any, usekeys: boolean, callback?: (modelProxy: any) => void) => {
    const model = _model_;
    let _modelProxy,
        selectedOption,
        filterField;

    // reset isChecked flag for displayOptions.
    if (displayOptions) {
        displayOptions.forEach(dataObj => {
            dataObj.isChecked = false;
        });
    }

    // If model is null, reset the modelProxy and displayValue.
    if (_.isNull(model) || _.isUndefined(model)) {
        if (_.isArray(modelProxy)) {
            _modelProxy = [];
        } else {
            _modelProxy = undefined;
        }
        callback(_modelProxy);
        return;
    }

    if (isDefined(displayOptions) && displayOptions.length && !usekeys) {
        // set the filterField depending on whether displayOptions contain 'dataObject', if not set filterField to 'key'
        filterField = _.get(displayOptions[0], 'dataObject') ? 'dataObject' : 'key';
        if (_.isArray(model)) {
            _modelProxy = [];
            model.forEach(modelVal => {
                selectedOption = _.find(displayOptions, obj => {
                    if (filterField === 'dataObject') {
                        return _.isEqual(JSON.parse(JSON.stringify(obj[filterField])), JSON.parse(JSON.stringify(modelVal)));
                    }
                    return _.toString(obj[filterField]) === _.toString(modelVal);
                });
                if (selectedOption) {
                    selectedOption.isChecked = true;
                    _modelProxy.push(selectedOption.key);
                }
            });
        } else {
            _modelProxy = undefined;
            selectedOption = _.find(displayOptions, obj => {
                if (filterField === 'dataObject') {
                    return _.isEqual(JSON.parse(JSON.stringify(obj[filterField])), JSON.parse(JSON.stringify(model)));
                }
                return _.toString(obj[filterField]) === _.toString(model);
            });
            if (selectedOption) {
                selectedOption.isChecked = true;
                _modelProxy = selectedOption.key;
            }
        }
    } else {
        _modelProxy = model;
    }

    callback(_modelProxy);
};

/**
 * This function retrieves the displayValue from displayOptions.
 */
export const getDisplayValues = (displayOptions: any[]) => {
    let displayValue;
    const selectedOptions = _.filter(displayOptions, {'isChecked': true});

    if (selectedOptions.length === 1) {
        displayValue = selectedOptions[0].value;
    } else {
        selectedOptions.forEach(option => {
            displayValue.push(option.value);
        });
    }
    return displayValue;
};

/**
 * Private method to get the unique objects by the data field
 */
export const getUniqObjsByDataField = (data, dataField, displayField, isLocalSearch?) => {
    let uniqData;
    const isAllFields = dataField === ALLFIELDS;

    uniqData = isAllFields ? _.uniqWith(data, _.isEqual) : _.uniqBy(data, 'key');

    if (!displayField && isLocalSearch) {
        return uniqData;
    }

    // return objects having non empty datafield and display field values.
    return _.filter(uniqData, (obj) => {
        if (isAllFields) {
            return _.trim(obj.label);
        }
        return _.trim(obj.key) && _.trim(obj.label);
    });
};

/**
 * This function sets the selectedItem by comparing the field values, where fields are passed by "compareby" property.
 * works only for datafield with ALL_FIELDS
 * @param datasetItems list of dataset items.
 * @param compareWithDataObj represents the datavalue (object) whose properties are to be checked against each property of datasetItem.
 * @param compareByField specifies the property names on which datasetItem has to be compared against datavalue object.
 */
export const setItemByCompare = (datasetItems, compareWithDataObj, compareByField) => {
    // compare the fields based on fields given to compareby property.
    datasetItems.some(function (opt) {
        if (isEqualWithFields(opt.value, compareWithDataObj, compareByField)) {
            opt.selected = true;
            return true;
        }
        return false;
    });
};

// Todo: convert to Class
interface DataSetProps {
    datafield: string;
    displayfield?: string;
    displayexpression?: string;
    usekeys?: boolean;
    orderby?: string;
}

/**
 * key represents the datafield value
 * label represents display value or expression value
 * value displayValue for primitives and data object for allFields
 * imgSrc picture source
 * selected represents boolean to notify selected item.
 */
export class DataSetItem {
    key: any;
    label: any;
    value: any;
    index?: number;
    imgSrc?: string;
    selected?: boolean = false;
}
