import { getObjValueByKey, getEvaluatedData } from './widget-utils';

declare const _;

const ALLFIELDS = 'All Fields';

/**
 * return the default display field, if the widget does not have a display field or it is set to All fields
 */
export const getDisplayField = (dataSet: any, displayField: string) => {
    /*if displayField is not set or set to all fields*/
    if (!displayField || displayField === ALLFIELDS) {
        /*if dataSet is an array*/
        if (_.isArray(dataSet) && dataSet.length > 0) {
            /*if dataSet is an array of objects*/
            if (_.isObject(dataSet[0])) {
                /* get the first field of the object*/
                displayField = Object.keys(dataSet[0])[0];
            } else {
                displayField = '';
            }
        } else if (_.isObject(dataSet)) {
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
        displayField = getDisplayField(dataSet, options.displayfield || options.datafield),
        data = [];

    if (_.isString(dataSet)) {
        dataSet = dataSet.split(',').map(str => str.trim());
    }

    if (useKeys && _.isObject(dataSet[0])) {
        /*getting keys of the object*/
        objectKeys = Object.keys(dataSet[0]);
        /*iterating over object keys and creating checkboxset dataset*/
        objectKeys.forEach((_key) => {
            data.push({'key': _key, 'value': _key});
        });
        return data;
    }

    // if filter dataSet if dataField is selected other than 'All Fields'
    if (dataField && dataField !== ALLFIELDS) {
        // Widget selected item dataset will be object instead of array.
        if (_.isObject(dataSet) && !_.isArray(dataSet)) {
            key = getObjValueByKey(dataSet, dataField);
            value = getEvaluatedData(dataSet, {
                displayfield: options.displayfield, displayexpression: options.displayexpression
            });
            data.push({'key': key, 'value': value});
        } else {
            if (_.isObject(dataSet[0])) {
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
            if (_.isObject(option)) {
                if (options.datafield === ALLFIELDS) {
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
                if (_.isArray(dataSet)) {
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
        return _.cloneDeep(dataSet);
    }

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
 * This function parses the dataset and extracts the displayOptions from parsed dataset.
 * displayOption will contain datafield as key, displayfield as value.
 */
export const extractDisplayOptions = (dataSet: any, options: DataSetProps): any[] => {
    let newDataSet,
        displayOptions = [];

    if (!dataSet) {
        return [];
    }
    newDataSet = getOrderedDataSet(dataSet, options.orderby);

    if (!_.isEmpty(newDataSet)) {
        displayOptions = extractDataObjects(newDataSet, options);
    }

    displayOptions = _.uniqBy(displayOptions, 'key');

    // Omit all the options whose datafield (key) is null or undefined.
    _.remove(displayOptions, (opt) => {
        return _.isUndefined(opt.key) || _.isNull(opt.key);
    });

    return displayOptions;
};

/**
 * This function finds the displayOption whose key is equal to the value and sets the isChecked flag for that displayOptions.
 */
export const updateCheckedValue = (value: any, displayOptions: any[]) => {
    const checkedDisplayOption = _.find(displayOptions, function (dataObj) {
        return _.toString(dataObj.key) === _.toString(value);
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
    if (!_isChangedManually && _.isUndefined(selectedValue) && !_.isUndefined(model)) {
        _model_ = selectedValue;
    } else if (_.isNull(selectedValue)) { // key can never be null, so return model as undefined.
        _model_ = selectedValue;
    } else if (datafield === ALLFIELDS) {
        selectedOption = _.find(displayOptions, {key: selectedValue});
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
    if (!_isChangedManually && !_.isUndefined(_model_) && (_.isUndefined(selectedCheckboxValue) || (_.isArray(selectedCheckboxValue) && !selectedCheckboxValue.length))) {
        datavalue = selectedCheckboxValue;
    } else if (selectedCheckboxValue) {
        _model_ = [];
        selectedCheckboxValue.forEach(value => {
            if (datafield === 'All Fields') {
                selectedOption = _.find(displayOptions, {key: value});
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
    if (_.isNull(model) || _.isUndefined(model)) {
        if (_.isArray(modelProxy)) {
            _modelProxy = [];
        } else {
            _modelProxy = undefined;
        }
        return _modelProxy;
    }

    if (!_.isUndefined(displayOptions) && !usekeys) {
        // set the filterField depending on whether displayOptions contain 'dataObject', if not set filterField to 'key'
        filterField = _.get(displayOptions[0], 'dataObject') ? 'dataObject' : 'key';
        if (_.isArray(model)) {
            _modelProxy = [];
            model.forEach(modelVal => {
                selectedOption = _.find(displayOptions, function (obj) {
                    if (filterField === 'dataObject') {
                        return _.isEqual(JSON.parse(JSON.stringify(obj[filterField])), JSON.parse(JSON.stringify(modelVal)));
                    }
                    return _.toString(obj[filterField]) === _.toString(modelVal);
                });
                if (selectedOption) {
                    _modelProxy.push(selectedOption.key);
                }
            });
        } else {
            _modelProxy = undefined;
            selectedOption = _.find(displayOptions, function (obj) {
                if (filterField === 'dataObject') {
                    return _.isEqual(JSON.parse(JSON.stringify(obj[filterField])), JSON.parse(JSON.stringify(model)));
                }
                return _.toString(obj[filterField]) === _.toString(model);
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

    if (_.isArray(_modelProxy)) {
        displayValue = [];
        _modelProxy.forEach(val => {
            selectedOption = updateCheckedValue(val, displayOptions);
            if (selectedOption) {
                displayValue.push(selectedOption.value);
            }
        });
    } else {
        displayValue = undefined;
        selectedOption = updateCheckedValue(_modelProxy, displayOptions);
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
