import { getObjValueByKey, getEvaluatedData } from './widget-utils';

import {
    isArray as _isArray,
    isObject as _isObject,
    isString as _isString,
    cloneDeep as _cloneDeep,
    orderBy as _orderBy,
    isEmpty as _isEmpty,
    remove as _remove,
    uniqBy as _uniqBy,
    isNull as _isNull,
    isUndefined as _isUndefined,
    find as _find,
    get as _get,
    isEqual as _isEqual,
} from 'lodash';

const ALLFIELDS = 'All Fields';

/**
 * return the default display field, if the widget does not have a display field or it is set to All fields
 */
export const getDisplayField = (dataSet: any, displayField: string) => {
    /*if displayField is not set or set to all fields*/
    if (!displayField || displayField === this.ALLFIELDS) {
        /*if dataSet is an array*/
        if (_isArray(dataSet) && dataSet.length > 0) {
            /*if dataSet is an array of objects*/
            if (_isObject(dataSet[0])) {
                /* get the first field of the object*/
                displayField = Object.keys(dataSet[0])[0];
            } else {
                displayField = '';
            }
        } else if (_isObject(dataSet)) {
            displayField = '';
        }
    }
    /* return dataValue to be the default key */
    return displayField;
};

/**
 * parse dataSet to filter the options based on the datafield, displayfield & displayexpression
 */
const extractDataObjects = (dataSet: any, options: DataSetProps) => {
    /*store parsed data in 'data'*/
    let objectKeys = [],
        key,
        value;

    const useKeys = options.usekeys,
        dataField = options.datafield,
        displayField = this.getDisplayField(dataSet, options.displayfield || options.datafield),
        data = [];

    if (_isString(dataSet)) {
        dataSet = dataSet.split(',').map(str => str.trim());
    }

    if (useKeys && _isObject(dataSet[0])) {
        /*getting keys of the object*/
        objectKeys = Object.keys(dataSet[0]);
        /*iterating over object keys and creating checkboxset dataset*/
        objectKeys.forEach((_key) => {
            data.push({'key': _key, 'value': _key});
        });
        return data;
    }

    // if filter dataSet if dataField is selected other than 'All Fields'
    if (dataField && dataField !== this.ALLFIELDS) {
        // Widget selected item dataset will be object instead of array.
        if (_isObject(dataSet) && !_isArray(dataSet)) {
            key = getObjValueByKey(dataSet, dataField);
            value = getEvaluatedData(dataSet, {
                displayfield: options.displayfield, displayexpression: options.displayexpression
            });
            data.push({'key': key, 'value': value});
        } else {
            if (_isObject(dataSet[0])) {
                dataSet.forEach((option) => {
                    key = getObjValueByKey(option, dataField);
                    value = getEvaluatedData(option, {
                        displayfield: options.displayfield, displayexpression: options.displayexpression
                    });
                    data.push({'key': key, 'value': value});
                });
            } else {
                dataSet.forEach((option) => {
                    data.push({'key': option, 'value': option});
                });
            }
        }

    } else {
        dataSet.forEach((option, index) => {
            if (_isObject(option)) {
                if (options.datafield === this.ALLFIELDS) {
                    key = index;
                    value = getEvaluatedData(option, {
                        displayfield: options.displayfield, displayexpression: options.displayexpression
                    });

                    data.push({'key': key + '', 'value': value, 'dataObject': option});
                } else {
                    key = getObjValueByKey(option, dataField);
                    value = getEvaluatedData(option, {
                        displayfield: options.displayfield, displayexpression: options.displayexpression
                    });
                    data.push({'key': key, 'value': value});
                }
            } else {
                if (_isArray(dataSet)) {
                    data.push({'key': option, 'value': option});
                } else {
                    // If dataset is object with key, value and useKeys set to true, only keys are to be returned.
                    data.push({'key': index, 'value': useKeys ? index : option});
                }
            }
        });
    }
    return data;
};

/**
 * function to get the ordered dataset based on the given orderby
 */
export const getOrderedDataSet = (dataSet: any, orderBy: string) => {
    if (!orderBy) {
        return _cloneDeep(dataSet);
    }

    const items = orderBy.split(','),
        fields = [],
        directions = [];
    items.forEach(obj => {
        const item = obj.split(':');
        fields.push(item[0]);
        directions.push(item[1]);
    });
    return _orderBy(dataSet, fields, directions);
};

/**
 * This function parses the dataset and extracts the displayOptions from parsed dataset.
 * displayOption will contain datafield as key, displayfield as value.
 */
export const extractDisplayOptions = (dataSet: any, options: DataSetProps): any[] => {
    let newDataSet,
        displayOptions = [];

    if (!dataSet) {
        return [];
    }
    newDataSet = this.getOrderedDataSet(dataSet, options.orderby);

    if (!_isEmpty(newDataSet)) {
        displayOptions = this.extractDataObjects(newDataSet, options);
    }

    displayOptions = _uniqBy(displayOptions, 'key');

    // Omit all the options whose datafield (key) is null or undefined.
    _remove(displayOptions, (opt) => {
        return _isUndefined(opt.key) || _isNull(opt.key);
    });

    return displayOptions;
};

/**
 * This function finds the displayOption whose key is equal to the value and sets the isChecked flag for that displayOptions.
 */
export const updateCheckedValue = (value: any, displayOptions: any[]) => {
    const checkedDisplayOption = _find(displayOptions, function (dataObj) {
        return _isString(dataObj.key) === _isString(value);
    });
    // set the isChecked flag for selected radioset value.
    if (checkedDisplayOption) {
        checkedDisplayOption.isChecked = true;
    }
    return checkedDisplayOption;
};

/**
 * This function assigns the model value depending on modelProxy. Here model can be object or string.
 * If datafield is ALLFIELDS, modelProxy is 0, then model will be retrieved from dataObject in displayOptions
 * If datafield is other than ALLFIELDS, the modelProxy and model will be retrieved from key in displayOptions
 */
export const assignModelForSelected = (displayOptions: any[], model: any, modelProxy: any, datafield: string, _isChangedManually: boolean) => {
    let selectedOption,
        _model_;
    const selectedValue = modelProxy;

    // ModelProxy is undefined, then update the _dataVal which can be used when latest dataset is obtained.
    if (!_isChangedManually && _isUndefined(selectedValue) && !_isUndefined(model)) {
        _model_ = selectedValue;
    } else if (_isNull(selectedValue)) { // key can never be null, so return model as undefined.
        _model_ = selectedValue;
    } else if (datafield === this.ALLFIELDS) {
        selectedOption = _find(displayOptions, {key: selectedValue});
        if (selectedOption) {
            _model_ = selectedOption.dataObject;
        }
    } else {
        _model_ = selectedValue;
    }
    return _model_;
};

/**
 * This function iterates over the modelProxy and returns the model value. Here model is array of values.
 * If datafield is ALLFIELDS, modelProxy is 0, then model will be retrieved from dataObject in displayOptions
 * If datafield is other than ALLFIELDS, the modelProxy and model will be retrieved from key in displayOptions
 */
export const assignModelForMultiSelect = (displayOptions: any, datafield: any, modelProxy: any, _model_: any, _isChangedManually: boolean) => {
    let selectedOption,
        datavalue;
    const selectedCheckboxValue = modelProxy;

    // ModelProxy is undefined or [] , then update the _dataVal which can be used when latest dataset is obtained.
    if (!_isChangedManually && !_isUndefined(_model_) && (_isUndefined(selectedCheckboxValue) || (_isArray(selectedCheckboxValue) && !selectedCheckboxValue.length))) {
        datavalue = selectedCheckboxValue;
    } else if (selectedCheckboxValue) {
        _model_ = [];
        selectedCheckboxValue.forEach(value => {
            if (datafield === 'All Fields') {
                selectedOption = _find(displayOptions, {key: value});
                _model_.push(selectedOption.dataObject);
            } else {
                _model_.push(value);
            }
        });

        return _model_;
    }
};

/**
 * function to update the checked values, which selects/ de-selects the values in radioset/ checkboxset
 */
export const updatedCheckedValues = (displayOptions: any[], _model_: any, modelProxy: any, usekeys: boolean) => {
    const model = _model_;
    let _modelProxy,
        selectedOption,
        filterField;

    // reset isChecked flag for displayOptions.
    displayOptions.forEach(dataObj => {
        dataObj.isChecked = false;
    });

    // If model is null, reset the modelProxy and displayValue.
    if (_isNull(model) || _isUndefined(model)) {
        if (_isArray(modelProxy)) {
            _modelProxy = [];
        } else {
            _modelProxy = undefined;
        }
        return _modelProxy;
    }

    if (!_isUndefined(displayOptions) && !usekeys) {
        // set the filterField depending on whether displayOptions contain 'dataObject', if not set filterField to 'key'
        filterField = _get(displayOptions[0], 'dataObject') ? 'dataObject' : 'key';
        if (_isArray(model)) {
            _modelProxy = [];
            model.forEach(modelVal => {
                selectedOption = _find(displayOptions, function (obj) {
                    if (filterField === 'dataObject') {
                        return _isEqual(JSON.parse(JSON.stringify(obj[filterField])), JSON.parse(JSON.stringify(modelVal)));
                    }
                    return _isString(obj[filterField]) === _isString(modelVal);
                });
                if (selectedOption) {
                    _modelProxy.push(selectedOption.key);
                }
            });
        } else {
            _modelProxy = undefined;
            selectedOption = _find(displayOptions, function (obj) {
                if (filterField === 'dataObject') {
                    return _isEqual(JSON.parse(JSON.stringify(obj[filterField])), JSON.parse(JSON.stringify(model)));
                }
                return _isString(obj[filterField]) === _isString(model);
            });
            if (selectedOption) {
                _modelProxy = selectedOption.key;
            }
        }
    } else {
        _modelProxy = model;
    }

    return _modelProxy;

};

/**
 * This function sets the displayValue, isChecked flag for select, radioset, checkboxset widgets.
 */
export const setCheckedAndDisplayValues = (displayOptions: any[], _modelProxy: any) => {
    let selectedOption,
        displayValue;

    if (_isArray(_modelProxy)) {
        displayValue = [];
        _modelProxy.forEach(val => {
            selectedOption = this.updateCheckedValue(val, displayOptions);
            if (selectedOption) {
                displayValue.push(selectedOption.value);
            }
        });
    } else {
        displayValue = undefined;
        selectedOption = this.updateCheckedValue(_modelProxy, displayOptions);
        if (selectedOption) {
            displayValue = selectedOption.value;
        }
    }
    return displayValue;
};

interface DataSetProps {
    datafield: string;
    displayfield?: string;
    displayexpression?: string;
    usekeys?: boolean;
    orderby?: string;
}
